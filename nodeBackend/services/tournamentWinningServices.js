// tournament-winner-service.js
const mongoose = require('mongoose');
const Tournament = require('../models/tournamentModel');
const WalletUser = require('../models/walletUserModel');
const UserTeam = require('../models/userTeamModel');
const TournamentResult = require('../models/TournamentResultModel');
const Team = require('../models/team');
const TwitterData = require('../models/twitterDataModel');
const cron = require('node-cron');
const io = require('../server');

class TournamentWinnerService {
  /**
   * Initializes the service by setting up cron jobs
   */
  static initialize() {
    // Check for tournaments nearing completion and ready for distribution every 15 minutes
    cron.schedule('*/15 * * * *', async () => {
      console.log(
        'Checking for tournaments nearing completion or needing distribution...',
      );
      await this.processTournamentLifecycle();
    });

    console.log('Tournament winner service initialized');
  }

  static async processTournamentLifecycle() {
    try {
      const now = new Date();

      // Find tournaments that are active and in the pre-calculation window
      const tournamentsNearingCompletion = await Tournament.find({
        isActive: true,
        endDate: {
          $gt: new Date(now.getTime() - 60 * 60 * 1000), // 1 hour before now
          $lte: new Date(now.getTime() + 60 * 60 * 1000), // 1 hour after now
        },
      });

      // Process tournaments nearing completion
      for (const tournament of tournamentsNearingCompletion) {
        // Check if winners have already been calculated
        const existingResult = await TournamentResult.findOne({
          tournamentId: tournament._id,
          calculatedAt: { $exists: true },
        });

        if (!existingResult) {
          console.log(`Calculating winners for tournament ${tournament.name}`);
          await this.calculateTournamentWinners(tournament._id);
        }
      }

      // Find tournaments that have ended and need distribution
      const completedTournaments = await Tournament.find({
        isActive: true,
        endDate: { $lte: now },
      });
      console.log(completedTournaments);

      // Process and distribute prizes for completed tournaments
      for (const tournament of completedTournaments) {
        // Check if results have already been distributed
        const existingResult = await TournamentResult.findOne({
          tournamentId: tournament._id,
          distributed: true,
        });
        console.log('existing resultd', existingResult);

        if (!existingResult) {
          console.log(`Distributing prizes for tournament ${tournament.name}`);
          await this.calculateAndDistributeTournamentWinners(tournament._id);
        }
      }
    } catch (error) {
      console.error('Error processing tournament lifecycle:', error);
    }
  }

  static async calculateAndDistributeTournamentWinners(tournamentId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get tournament data
      const tournament =
        await Tournament.findById(tournamentId).session(session);
      if (!tournament || !tournament.isActive) {
        throw new Error('Tournament not found or not active');
      }

      // Check if tournament has enough participants
      if (tournament.participated.length < 1) {
        console.log(
          `Tournament ${tournament.name} doesn't have enough participants`,
        );
        await this.markTournamentAsCompleted(tournament, session);
        return;
      }

      // Fetch user teams and calculate winners
      const userTeams = await UserTeam.find({
        tournamentId: tournamentId,
        isActive: true,
      })
        .populate({
          path: 'sections.selectedTeams',
          model: 'Team',
          select: 'twitterId name followers points',
        })
        .session(session);

      if (userTeams.length === 0) {
        console.log(
          `No active user teams found for tournament ${tournament.name}`,
        );
        await this.markTournamentAsCompleted(tournament, session);
        return;
      }

      // Fetch Twitter engagement data
      const teamEngagementData =
        await this.fetchTwitterEngagementFromDatabase(tournamentId);

      // Calculate user scores
      const userScores = await this.calculateUserScores(
        userTeams,
        teamEngagementData,
      );

      // Sort and distribute prizes
      const rankedUsers = userScores.sort((a, b) => b.score - a.score);
      const prizeDistribution = this.calculatePrizeDistribution(
        rankedUsers,
        tournament.prizePool,
        tournament.participated.length,
      );

      // Store and distribute results
      // await this.storeTournamentResults(
      //   tournamentId,
      //   prizeDistribution,
      //   session,
      // );
      await this.distributePrizes(tournamentId, session);

      // Mark tournament as completed
      // await this.markTournamentAsCompleted(tournament, session);

      await session.commitTransaction();
      console.log(`Successfully processed tournament ${tournament.name}`);
    } catch (error) {
      await session.abortTransaction();
      console.error(`Error processing tournament winners: ${error.message}`);
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async markTournamentAsCompleted(tournament, session) {
    tournament.isActive = false;
    // tournament.status = 'completed';
    await tournament.save({ session });
  }

  /**
   * Calculates winners for a specific tournament using existing Twitter data
   * @param {ObjectId} tournamentId - Tournament ID
   */

  static async calculateTournamentWinners(tournamentId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Existing winner calculation logic
      const tournament =
        await Tournament.findById(tournamentId).session(session);

      // Check participant requirements
      if (tournament.participated.length < 1) {
        console.log(
          `Tournament ${tournament.name} doesn't have enough participants`,
        );
        await session.commitTransaction();
        return;
      }

      // Fetch user teams
      const userTeams = await UserTeam.find({
        tournamentId: tournamentId,
        isActive: true,
      })
        .populate({
          path: 'sections.selectedTeams',
          model: 'Team',
          select: 'twitterId name followers points',
        })
        .session(session);

      if (userTeams.length === 0) {
        console.log(
          `No active user teams found for tournament ${tournament.name}`,
        );
        await session.commitTransaction();
        return;
      }

      // Fetch Twitter engagement data
      const teamEngagementData =
        await this.fetchTwitterEngagementFromDatabase(tournamentId);

      // Calculate user scores
      const userScores = await this.calculateUserScores(
        userTeams,
        teamEngagementData,
      );

      // Sort and distribute prizes
      const rankedUsers = userScores.sort((a, b) => b.score - a.score);
      const prizeDistribution = this.calculatePrizeDistribution(
        rankedUsers,
        tournament.prizePool,
        tournament.participated.length,
      );

      // Store tournament results
      await this.storeTournamentResults(
        tournamentId,
        prizeDistribution,
        session,
      );

      await session.commitTransaction();
      console.log(
        `Successfully calculated winners for tournament ${tournament.name}`,
      );
    } catch (error) {
      await session.abortTransaction();
      console.error(`Error calculating tournament winners: ${error.message}`);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Fetches Twitter engagement data from the database instead of API
   * @param {ObjectId} tournamentId - Tournament ID
   * @returns {Object} - Map of team IDs to engagement scores
   */
  static async fetchTwitterEngagementFromDatabase(tournamentId) {
    try {
      // Get all Twitter data for this tournament
      const allTwitterData = await TwitterData.find({ tournamentId });

      if (!allTwitterData.length) {
        console.log(`No Twitter data found for tournament ${tournamentId}`);
        return {};
      }

      console.log(
        `Found ${allTwitterData.length} Twitter data entries for tournament ${tournamentId}`,
      );

      // Create engagement data object
      const engagementData = {};

      // Process all Twitter data
      allTwitterData.forEach((data) => {
        if (!data.twitterId) return;

        // Calculate total engagement metrics from stored tweets
        let totalLikes = 0;
        let totalRetweets = 0;
        let totalReplies = 0;
        let tweetsCount = 0;

        // Process all tweets
        if (data.tweets && data.tweets.length > 0) {
          data.tweets.forEach((tweet) => {
            totalLikes += tweet.metrics?.likeCount || 0;
            totalRetweets += tweet.metrics?.retweetCount || 0;
            totalReplies += tweet.metrics?.replyCount || 0;
            tweetsCount++;
          });
        }

        // Store engagement data
        engagementData[data.twitterId] = {
          likes: totalLikes,
          retweets: totalRetweets,
          replies: totalReplies,
          tweetsCount,
          viewCount: data.stats?.viewCount || 0,
          // Calculate total engagement with weighted metrics
          get totalEngagement() {
            return (
              this.likes +
              this.retweets * 2 +
              this.replies * 1.5 +
              this.viewCount * 0.1 +
              // Add activity bonus to reward consistent posting
              this.tweetsCount * 5
            );
          },
          // Add team metadata for reference
          teamName: data.teamName,
          teamId: data.teamId,
        };

        // Add logging
        console.log(
          `Processed engagement data for Twitter ID: ${data.twitterId} (${data.teamName})`,
        );
        console.log(
          `  - Likes: ${totalLikes}, Retweets: ${totalRetweets}, Replies: ${totalReplies}`,
        );
        console.log(
          `  - Activity: ${tweetsCount} tweets, Views: ${data.stats?.viewCount || 0}`,
        );
      });

      return engagementData;
    } catch (error) {
      console.error(
        'Error fetching Twitter engagement data from database:',
        error,
      );
      throw new Error(
        `Failed to fetch Twitter engagement data: ${error.message}`,
      );
    }
  }

  /**
   * Calculates scores for each user team based on Twitter engagement
   * @param {Array} userTeams - List of user teams
   * @param {Object} teamEngagementData - Map of team IDs to engagement scores
   * @returns {Array} - List of users with their scores
   */
  static async calculateUserScores(userTeams, teamEngagementData) {
    try {
      return userTeams.map((userTeam) => {
        let totalScore = 0;
        const teamScores = [];

        // Calculate score based on team engagement
        userTeam.sections.forEach((section) => {
          section.selectedTeams.forEach((team) => {
            if (team.twitterId && teamEngagementData[team.twitterId]) {
              // Get engagement data
              const engagement =
                teamEngagementData[team.twitterId].totalEngagement;

              // Calculate follower bonus (logarithmic scale to prevent huge teams from dominating)
              const followerBonus = Math.log10(team.followers + 1) * 15;

              // Calculate team score with diminishing returns for extremely high engagement
              const engagementFactor = Math.log(engagement + 1) * 20;
              const teamScore = engagementFactor * (1 + followerBonus / 100);

              // Store individual team scores for debugging
              teamScores.push({
                teamId: team._id,
                teamName: team.name,
                twitterId: team.twitterId,
                engagement,
                followers: team.followers,
                teamScore,
              });

              totalScore += teamScore;
            }
          });
        });

        return {
          userId: userTeam.userId,
          walletUserId: userTeam.walletUserId,
          teamName: userTeam.teamName,
          score: totalScore,
          // Include detailed team scores for transparency
          teamBreakdown: teamScores,
        };
      });
    } catch (error) {
      console.error('Error calculating user scores:', error);
      throw new Error('Failed to calculate user scores');
    }
  }

  /**
   * Calculates prize distribution based on rankings and prize pool
   * @param {Array} rankedUsers - List of users sorted by score
   * @param {Number} prizePool - Total prize pool in SOL
   * @param {Number} participantCount - Total number of participants
   * @returns {Array} - List of users with their prizes
   */
  static calculatePrizeDistribution(rankedUsers, prizePool, participantCount) {
    // Define prize distribution percentages based on rank
    const prizeDistribution = [];
    console.log('CalculatePrizeDistribution');
    console.log(rankedUsers);
    console.log(prizePool);
    console.log(participantCount);

    // Distribute prizes only if we have enough participants
    if (rankedUsers.length > 0) {
      // Determine how many users will get prizes
      // At least 50% of prize pool goes to top 10 users
      // Calculate distribution based on participant count and prize pool size

      // Example distribution scheme based on rank
      // 1st place: 10% of prize pool
      // 2nd-10th place: 40% of prize pool distributed proportionally
      // 11th-50th place: 30% of prize pool distributed proportionally
      // Rest: 20% of prize pool distributed proportionally to top 50% of participants

      // First place (10% of prize pool)
      if (rankedUsers.length >= 1) {
        prizeDistribution.push({
          ...rankedUsers[0],
          prize: prizePool * 0.2,
          rank: 1,
        });
      }

      // 2nd-10th place (40% of prize pool)
      const secondTierTotal = prizePool * 0.4;
      const secondTierCount = Math.min(9, rankedUsers.length - 1);

      if (secondTierCount > 0) {
        // Calculate prize per user in this tier
        const secondTierPrizeBase = secondTierTotal / secondTierCount;

        // Distribute with slightly higher amounts for higher ranks
        for (let i = 0; i < secondTierCount; i++) {
          const rankFactor = (secondTierCount - i) / secondTierCount;
          const adjustedPrize = secondTierPrizeBase * rankFactor * 1.5;

          prizeDistribution.push({
            ...rankedUsers[i + 1],
            prize: adjustedPrize,
            rank: i + 2,
          });
        }
      }

      // 11th-50th place (30% of prize pool)
      const thirdTierTotal = prizePool * 0.3;
      const thirdTierStart = 1 + secondTierCount;
      const thirdTierCount = Math.min(40, rankedUsers.length - thirdTierStart);

      if (thirdTierCount > 0) {
        // Calculate prize per user in this tier
        const thirdTierPrizeBase = thirdTierTotal / thirdTierCount;

        // Distribute with slightly decreasing amounts for lower ranks
        for (let i = 0; i < thirdTierCount; i++) {
          const rankFactor = (thirdTierCount - i) / thirdTierCount;
          const adjustedPrize = thirdTierPrizeBase * rankFactor * 1.2;

          prizeDistribution.push({
            ...rankedUsers[i + thirdTierStart],
            prize: adjustedPrize,
            rank: i + thirdTierStart + 1,
          });
        }
      }

      // Remaining 20% to top 50% of participants (excluding those already rewarded)
      const fourthTierTotal = prizePool * 0.2;
      const fourthTierStart = thirdTierStart + thirdTierCount;
      const fourthTierEnd = Math.min(
        rankedUsers.length,
        Math.floor(participantCount * 0.5),
      );
      const fourthTierCount = Math.max(0, fourthTierEnd - fourthTierStart);

      if (fourthTierCount > 0) {
        // Calculate prize per user in this tier
        const fourthTierPrizeBase = fourthTierTotal / fourthTierCount;

        // Distribute evenly among remaining participants
        for (let i = 0; i < fourthTierCount; i++) {
          const userIndex = i + fourthTierStart;
          if (userIndex < rankedUsers.length) {
            prizeDistribution.push({
              ...rankedUsers[userIndex],
              prize: fourthTierPrizeBase,
              rank: userIndex + 1,
            });
          }
        }
      }

      // Add remaining users with zero prize
      for (
        let i = fourthTierStart + fourthTierCount;
        i < rankedUsers.length;
        i++
      ) {
        prizeDistribution.push({
          ...rankedUsers[i],
          prize: 0,
          rank: i + 1,
        });
      }
    }

    return prizeDistribution;
  }

  /**
   * Stores tournament results in the database
   * @param {ObjectId} tournamentId - Tournament ID
   * @param {Array} prizeDistribution - List of users with their prizes
   * @param {mongoose.ClientSession} session - MongoDB session for transaction
   */
  // static async storeTournamentResults(
  //   tournamentId,
  //   prizeDistribution,
  //   session,
  // ) {
  //   try {
  //     // Create a new tournament results collection or use existing one
  //     const TournamentResult = mongoose.model(
  //       'TournamentResult',
  //       new mongoose.Schema({
  //         tournamentId: {
  //           type: mongoose.Schema.Types.ObjectId,
  //           ref: 'Tournament',
  //           required: true,
  //         },
  //         results: [
  //           {
  //             walletUserId: {
  //               type: mongoose.Schema.Types.ObjectId,
  //               ref: 'WalletUser',
  //               required: true,
  //             },
  //             userId: String,
  //             teamName: String,
  //             score: Number,
  //             prize: Number,
  //             rank: Number,
  //             paid: {
  //               type: Boolean,
  //               default: false,
  //             },
  //           },
  //         ],
  //         calculatedAt: {
  //           type: Date,
  //           default: Date.now,
  //         },
  //         distributed: {
  //           type: Boolean,
  //           default: false,
  //         },
  //       }),
  //     );

  //     // Check if results already exist
  //     const existingResult = await TournamentResult.findOne({
  //       tournamentId,
  //     }).session(session);

  //     if (existingResult) {
  //       // Update existing results
  //       existingResult.results = prizeDistribution;
  //       existingResult.calculatedAt = new Date();
  //       await existingResult.save({ session });
  //     } else {
  //       // Create new results document
  //       await TournamentResult.create(
  //         [
  //           {
  //             tournamentId,
  //             results: prizeDistribution,
  //           },
  //         ],
  //         { session },
  //       );
  //     }
  //   } catch (error) {
  //     console.error('Error storing tournament results:', error);
  //     throw new Error('Failed to store tournament results');
  //   }
  // }

  static async storeTournamentResults(
    tournamentId,
    prizeDistribution,
    session,
  ) {
    try {
      // Check if results already exist
      const existingResult = await TournamentResult.findOne({
        tournamentId,
      }).session(session);

      if (existingResult) {
        // Update existing results
        existingResult.results = prizeDistribution;
        existingResult.calculatedAt = new Date();
        await existingResult.save({ session });
      } else {
        // Create new results document
        await TournamentResult.create(
          [
            {
              tournamentId,
              results: prizeDistribution,
            },
          ],
          { session },
        );
      }
    } catch (error) {
      console.error('Error storing tournament results:', error);
      throw new Error('Failed to store tournament results');
    }
  }

  /**
   * Schedules prize distribution at tournament end
   * @param {ObjectId} tournamentId - Tournament ID
   * @param {Date} endDate - Tournament end date
   */
  static async schedulePrizeDistribution(tournamentId, endDate) {
    try {
      // In a production environment, you might use a job scheduler like Bull or agenda.js
      // For this example, we'll use setTimeout
      const now = new Date();
      const timeUntilEnd = endDate.getTime() - now.getTime();

      if (timeUntilEnd > 0) {
        setTimeout(() => {
          this.distributePrizes(tournamentId).catch((error) =>
            console.error(`Error distributing prizes: ${error.message}`),
          );
        }, timeUntilEnd);

        console.log(
          `Scheduled prize distribution for tournament ${tournamentId} in ${timeUntilEnd / 1000} seconds`,
        );
      } else {
        // If tournament has already ended, distribute prizes immediately
        await this.distributePrizes(tournamentId);
      }
    } catch (error) {
      console.error('Error scheduling prize distribution:', error);
      throw new Error('Failed to schedule prize distribution');
    }
  }

  /**
   * Distributes prizes to tournament winners
   * @param {ObjectId} tournamentId - Tournament ID
   */
  static async distributePrizes(tournamentId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find tournament
      const tournament =
        await Tournament.findById(tournamentId).session(session);
      if (!tournament) {
        throw new Error('Tournament not found');
      }

      // Ensure tournament has ended
      const now = new Date();
      if (now < tournament.endDate) {
        console.log(
          `Tournament ${tournament.name} has not ended yet. Skipping prize distribution.`,
        );
        await session.commitTransaction();
        session.endSession();
        return;
      }

      // Find tournament results
      // const TournamentResult = mongoose.model('TournamentResult');
      const tournamentResult = await TournamentResult.findOne({
        tournamentId,
      }).session(session);

      if (!tournamentResult || tournamentResult.distributed) {
        console.log(
          `Tournament results not found or already distributed for ${tournament.name}`,
        );
        await session.commitTransaction();
        session.endSession();
        return;
      }

      const notificationResults = [];

      // Distribute prizes to winners
      for (const result of tournamentResult.results) {
        if (result.prize > 0) {
          // Find user wallet
          const wallet = await WalletUser.findById(result.walletUserId).session(
            session,
          );
          console.log(wallet);
          console.log(tournamentId);
          console.log(typeof tournamentId);
          if (wallet) {
            // Add tournament points equivalent to prize amount
            // This is where you'd handle the actual SOL transfer in a real implementation
            await wallet.addTournamentPoints(
              tournamentId,
              result.prize * 100,
              result.rank,
              result.prize,
              session,
            );

            const notification = {
              userId: wallet._id,
              tournamentId: tournament._id,
              tournamentName: tournament.name,
              rank: result.rank,
              prize: result.prize,
              message: this.generateCongratulationsMessage(
                result.rank,
                result.prize,
              ),
            };

            // Emit real-time notification
            if (io) {
              io.to(wallet._id.toString()).emit('prizeDisbursed', notification);
            }

            notificationResults.push(notification);
            // Mark as paid in results
            result.paid = true;
          }
        }
      }

      // Mark tournament results as distributed
      tournamentResult.distributed = true;
      await tournamentResult.save({ session });

      // Mark tournament as inactive
      tournament.isActive = false;
      await tournament.save({ session });

      // Send notifications to winners (would implement in a real system)

      await session.commitTransaction();
      console.log(
        `Successfully distributed prizes for tournament ${tournament.name}`,
      );
      return notificationResults;
    } catch (error) {
      await session.abortTransaction();
      console.error(`Error distributing prizes: ${error.message}`);
      throw error;
    } finally {
      session.endSession();
    }
  }

  static generateCongratulationsMessage(rank, prize) {
    const rankEmojis = ['🥇', '🥈', '🥉', '🎉', '🌟'];
    const emoji = rankEmojis[Math.min(rank - 1, 4)] || '🎊';

    const messages = [
      `${emoji} Congratulations! You've won the top prize of ${prize} SOL!`,
      `${emoji} Awesome job! You secured the ${this.getOrdinal(rank)} place with ${prize} SOL!`,
      `${emoji} Great performance! You've earned ${prize} SOL in the tournament!`,
    ];

    return messages[Math.min(rank - 1, 2)] || messages[2];
  }

  static getOrdinal(n) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  /**
   * Gets tournament leaderboard
   * @param {ObjectId} tournamentId - Tournament ID
   * @returns {Array} - Tournament leaderboard
   */
  static async getTournamentLeaderboard(tournamentId) {
    try {
      const TournamentResult = mongoose.model('TournamentResult');
      const tournamentResult = await TournamentResult.findOne({
        tournamentId,
      }).populate({
        path: 'results.walletUserId',
        select: 'walletAddress',
      });

      if (!tournamentResult) {
        // If results haven't been calculated yet, return placeholder
        return {
          status: 'pending',
          message: 'Tournament results are still being calculated',
          leaderboard: [],
        };
      }
      // console.log(tournamentResult);

      // Format leaderboard for API response
      const leaderboard = tournamentResult.results.map((result) => ({
        rank: result.rank,
        teamName: result.teamName,
        walletAddress: result.walletUserId
          ? result.walletUserId.walletAddress
          : 'Unknown',
        score: result.score,
        prize: result.prize,
        paid: result.paid,
      }));
      // console.log(leaderboard);

      return {
        status: 'completed',
        calculatedAt: tournamentResult.calculatedAt,
        distributed: tournamentResult.distributed,
        leaderboard,
      };
    } catch (error) {
      console.error('Error getting tournament leaderboard:', error);
      throw new Error('Failed to get tournament leaderboard');
    }
  }
}

module.exports = TournamentWinnerService;
