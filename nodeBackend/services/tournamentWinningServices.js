// tournament-winner-service.js
const mongoose = require('mongoose');
const Tournament = require('../models/tournamentModel');
const WalletUser = require('../models/walletUserModel');
const UserTeam = require('../models/userTeamModel');
const Team = require('../models/team');

class TournamentWinnerService {
  /**
   * Schedules winner calculation for all active tournaments
   * This should be run by a scheduler (e.g., cron job)
   */
  static async scheduleWinnerCalculations() {
    try {
      const activeTournaments = await Tournament.getActiveTournaments();

      for (const tournament of activeTournaments) {
        const now = new Date();
        const oneHourBeforeEnd = new Date(tournament.endDate);
        oneHourBeforeEnd.setHours(oneHourBeforeEnd.getHours() - 1);

        // If we're within the calculation window (one hour before end)
        if (now >= oneHourBeforeEnd && now <= tournament.endDate) {
          // Calculate winners if not already calculated
          await this.calculateTournamentWinners(tournament._id);
        }
      }
    } catch (error) {
      console.error('Error scheduling winner calculations:', error);
    }
  }

  /**
   * Calculates winners for a specific tournament
   * @param {ObjectId} tournamentId - Tournament ID
   */
  static async calculateTournamentWinners(tournamentId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get tournament data
      const tournament =
        await Tournament.findById(tournamentId).session(session);
      if (!tournament || !tournament.isOngoing) {
        throw new Error('Tournament not found or not ongoing');
      }

      // Check if tournament has enough participants
      if (tournament.participated.length < 3) {
        console.log(
          `Tournament ${tournament.name} doesn't have enough participants for prize distribution`,
        );
        await session.commitTransaction();
        session.endSession();
        return;
      }

      // Get all user teams for this tournament
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
        session.endSession();
        return;
      }

      // Fetch Twitter engagement data for all teams in this tournament
      const teamEngagementData =
        await this.fetchTwitterEngagementData(userTeams);

      // Calculate scores for each user team based on Twitter engagement
      const userScores = await this.calculateUserScores(
        userTeams,
        teamEngagementData,
      );

      // Sort users by score in descending order
      const rankedUsers = userScores.sort((a, b) => b.score - a.score);

      // Distribute prizes based on rankings and prize pool
      const prizeDistribution = this.calculatePrizeDistribution(
        rankedUsers,
        tournament.prizePool,
        tournament.participated.length,
      );

      // Store results in database
      await this.storeTournamentResults(
        tournamentId,
        prizeDistribution,
        session,
      );

      // Schedule prize distribution at tournament end
      await this.schedulePrizeDistribution(tournamentId, tournament.endDate);

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

  // Updated implementation with real Twitter API calls

  /**
   * Fetches Twitter engagement data for the past 24 hours for all teams
   * @param {Array} userTeams - List of user teams
   * @returns {Object} - Map of team IDs to engagement scores
   */
  static async fetchTwitterEngagementData(userTeams) {
    try {
      // Extract all Twitter IDs from user teams
      const twitterIds = new Set();
      userTeams.forEach((userTeam) => {
        userTeam.sections.forEach((section) => {
          section.selectedTeams.forEach((team) => {
            if (team.twitterId) {
              twitterIds.add(team.twitterId);
            }
          });
        });
      });

      // Convert to array
      const twitterIdArray = Array.from(twitterIds);

      // Create Twitter API v2 client with your credentials
      const { TwitterApi } = require('twitter-api-v2');

      const twitterClient = new TwitterApi({
        appKey: process.env.TWITTER_API_KEY,
        appSecret: process.env.TWITTER_API_SECRET,
        accessToken: process.env.TWITTER_ACCESS_TOKEN,
        accessSecret: process.env.TWITTER_ACCESS_SECRET,
        bearerToken: process.env.TWITTER_BEARER_TOKEN,
      });

      // Get the read-only client
      const roClient = twitterClient.readOnly;

      // Calculate timestamp for 24 hours ago (in ISO format)
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
      const startTime = twentyFourHoursAgo.toISOString();

      // Store engagement data for each Twitter ID
      const engagementData = {};

      // Process Twitter IDs in batches to avoid rate limits
      const batchSize = 10;
      for (let i = 0; i < twitterIdArray.length; i += batchSize) {
        const batch = twitterIdArray.slice(i, i + batchSize);

        // Process each Twitter ID in the current batch
        const batchPromises = batch.map(async (twitterId) => {
          try {
            // Get user details to access username
            const user = await roClient.v2.user(twitterId, {
              'user.fields': ['username'],
            });

            if (!user.data) {
              console.warn(`Twitter user not found for ID: ${twitterId}`);
              return;
            }

            const username = user.data.username;

            // Get recent tweets from this user
            const userTweets = await roClient.v2.userTimeline(twitterId, {
              max_results: 100,
              start_time: startTime,
              'tweet.fields': ['public_metrics', 'created_at'],
              exclude: ['retweets', 'replies'],
            });

            // Initialize engagement counters
            let totalLikes = 0;
            let totalRetweets = 0;
            let totalReplies = 0;
            let totalQuotes = 0;
            let tweetsCount = 0;

            // Process all tweets
            if (userTweets.data?.data) {
              for (const tweet of userTweets.data.data) {
                // Ensure tweet has public_metrics
                if (tweet.public_metrics) {
                  totalLikes += tweet.public_metrics.like_count || 0;
                  totalRetweets += tweet.public_metrics.retweet_count || 0;
                  totalReplies += tweet.public_metrics.reply_count || 0;
                  totalQuotes += tweet.public_metrics.quote_count || 0;
                  tweetsCount++;
                }
              }
            }

            // Get tweet count to measure activity level
            const userTweetCount = await roClient.v2.userTweetCount(twitterId, {
              start_time: startTime,
            });

            const activityCount = userTweetCount.data?.total || 0;

            // Store engagement data for this user
            engagementData[twitterId] = {
              likes: totalLikes,
              retweets: totalRetweets,
              replies: totalReplies,
              quotes: totalQuotes,
              tweetsCount,
              activityCount,
              // Calculate total engagement with weighted metrics
              get totalEngagement() {
                return (
                  this.likes +
                  this.retweets * 2 +
                  this.replies * 1.5 +
                  this.quotes * 2.5 +
                  // Add activity bonus to reward consistent posting
                  this.activityCount * 5
                );
              },
            };

            // Add some logging
            console.log(
              `Fetched engagement data for Twitter ID: ${twitterId} (${username})`,
            );
            console.log(
              `  - Likes: ${totalLikes}, Retweets: ${totalRetweets}, Replies: ${totalReplies}, Quotes: ${totalQuotes}`,
            );
            console.log(
              `  - Activity: ${activityCount} tweets in the last 24 hours`,
            );
          } catch (error) {
            console.error(
              `Error fetching data for Twitter ID ${twitterId}:`,
              error,
            );
            // Set default values if API call fails
            engagementData[twitterId] = {
              likes: 0,
              retweets: 0,
              replies: 0,
              quotes: 0,
              tweetsCount: 0,
              activityCount: 0,
              get totalEngagement() {
                return 0;
              },
            };
          }
        });

        // Wait for all promises in the current batch to resolve
        await Promise.all(batchPromises);

        // Add a small delay between batches to avoid rate limiting
        if (i + batchSize < twitterIdArray.length) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }

      // Add additional API calls to get engagement with the teams' content
      // This fetches recent tweets that mention or interact with these accounts
      for (const twitterId of twitterIdArray) {
        try {
          // Skip if we couldn't get basic data for this ID
          if (!engagementData[twitterId]) continue;

          // Get user details to access username
          const user = await roClient.v2.user(twitterId, {
            'user.fields': ['username'],
          });

          if (!user.data) continue;

          const username = user.data.username;

          // Search for mentions of this user in the last 24 hours
          const mentions = await roClient.v2.search(`@${username}`, {
            'tweet.fields': ['public_metrics', 'created_at'],
            max_results: 100,
            start_time: startTime,
          });

          let mentionLikes = 0;
          let mentionRetweets = 0;
          let mentionCount = 0;

          // Process mentions
          if (mentions.data?.data) {
            for (const mention of mentions.data.data) {
              if (mention.public_metrics) {
                mentionLikes += mention.public_metrics.like_count || 0;
                mentionRetweets += mention.public_metrics.retweet_count || 0;
                mentionCount++;
              }
            }
          }

          // Update engagement data with mention metrics
          engagementData[twitterId].mentions = mentionCount;
          engagementData[twitterId].mentionLikes = mentionLikes;
          engagementData[twitterId].mentionRetweets = mentionRetweets;

          // Update total engagement calculation
          const originalGetTotalEngagement =
            engagementData[twitterId].totalEngagement;
          Object.defineProperty(engagementData[twitterId], 'totalEngagement', {
            get: function () {
              return (
                originalGetTotalEngagement +
                this.mentions * 3 +
                this.mentionLikes * 0.5 +
                this.mentionRetweets * 1
              );
            },
          });

          console.log(
            `Added mention data for ${username}: ${mentionCount} mentions with ${mentionLikes} likes`,
          );
        } catch (error) {
          console.error(
            `Error fetching mentions for Twitter ID ${twitterId}:`,
            error,
          );
          // Continue with existing data if this part fails
        }
      }

      return engagementData;
    } catch (error) {
      console.error('Error fetching Twitter engagement data:', error);
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
          prize: prizePool * 0.1,
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
  static async storeTournamentResults(
    tournamentId,
    prizeDistribution,
    session,
  ) {
    try {
      // Create a new tournament results collection or use existing one
      const TournamentResult = mongoose.model(
        'TournamentResult',
        new mongoose.Schema({
          tournamentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tournament',
            required: true,
          },
          results: [
            {
              walletUserId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'WalletUser',
                required: true,
              },
              userId: String,
              teamName: String,
              score: Number,
              prize: Number,
              rank: Number,
              paid: {
                type: Boolean,
                default: false,
              },
            },
          ],
          calculatedAt: {
            type: Date,
            default: Date.now,
          },
          distributed: {
            type: Boolean,
            default: false,
          },
        }),
      );

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
      const TournamentResult = mongoose.model('TournamentResult');
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

      // Distribute prizes to winners
      for (const result of tournamentResult.results) {
        if (result.prize > 0) {
          // Find user wallet
          const wallet = await WalletUser.findById(result.walletUserId).session(
            session,
          );
          if (wallet) {
            // Add tournament points equivalent to prize amount
            // This is where you'd handle the actual SOL transfer in a real implementation
            await wallet.addTournamentPoints(
              tournamentId,
              result.prize * 100, // Convert SOL to points (arbitrary conversion)
              session,
            );

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
    } catch (error) {
      await session.abortTransaction();
      console.error(`Error distributing prizes: ${error.message}`);
      throw error;
    } finally {
      session.endSession();
    }
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
