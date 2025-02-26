import { useState, useRef, useId, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setTeams } from "@/store/teamsSlice";
import { Team } from "@/types/team.types";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useAppSelector } from "@/hooks/reduxHooks";
import { updateTournamentTeamSelectionPoints } from "@/store/userSlice";
import { getTournamentTeamSelectionPoints } from "@/store/userSlice";
import toast from "react-hot-toast";
import { useOutsideClick } from "../hooks/use-outside-click";
import { useParams } from "next/navigation";

type SelectionState = {
  isPending: boolean;
  isSelected: boolean;
};

interface SelectionMap {
  [key: string]: SelectionState;
}

interface InfluencersTeamSectionProps {
  sectionName: string;
  teamsSectionId: string;
  teams: Team[];
}

export function InfluencersTeamSection({
  sectionName,
  teams,
  teamsSectionId,
}: InfluencersTeamSectionProps) {
  const [active, setActive] = useState<Team | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team[]>([]);
  const [selectionStates, setSelectionStates] = useState<SelectionMap>({});
  const [showPointsInfo, setShowPointsInfo] = useState(false);
  const ref = useRef<HTMLDivElement>(null as unknown as HTMLDivElement);
  const id = useId();

  const dispatch = useDispatch();
  const { tourId } = useParams();
  const tournamentTeamSelectionPoints = useAppSelector((state) =>
    getTournamentTeamSelectionPoints(state, tourId as string)
  );

  const handleTeamUpdate = (selectedTeam: Team[]) => {
    dispatch(
      setTeams({
        sectionName,
        sectionId: teamsSectionId,
        selectedTeam,
      })
    );
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActive(null);
      }
    };

    if (active) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  const handleTeamSelection = (member: Team) => {
    const currentState = selectionStates[member.name] || {
      isPending: false,
      isSelected: false,
    };

    if (currentState.isSelected) {
      // Remove from team and restore points
      const updatedTeam = selectedTeam.filter(
        (teamMember) => teamMember.name !== member.name
      );
      setSelectedTeam(updatedTeam);
      setSelectionStates({
        ...selectionStates,
        [member.name]: { isPending: false, isSelected: false },
      });
      handleTeamUpdate(updatedTeam);

      // Restore points when removing a team member - now tournament specific
      const pointsToRestore = member.points || 250;
      dispatch(
        updateTournamentTeamSelectionPoints({
          tournamentId: tourId as string,
          points: pointsToRestore,
        })
      );

      toast.success(
        `Removed ${member.name}. +${pointsToRestore} points returned.`
      );

      // Show points info when a team member is removed
      setShowPointsInfo(true);
      setTimeout(() => setShowPointsInfo(false), 3000);
    } else {
      // Check if we have enough points
      const memberPoints = member.points || 250;
      if (tournamentTeamSelectionPoints < memberPoints) {
        toast.error(
          `Not enough points! You need ${memberPoints} points to select ${member.name}.`
        );

        // Show points info when selection fails due to insufficient points
        setShowPointsInfo(true);
        setTimeout(() => setShowPointsInfo(false), 3000);
        return;
      }

      // Start selection process
      setSelectionStates({
        ...selectionStates,
        [member.name]: { isPending: true, isSelected: false },
      });

      // Animate and then add to team after delay
      setTimeout(() => {
        const updatedTeam = [...selectedTeam, member];
        setSelectedTeam(updatedTeam);
        setSelectionStates({
          ...selectionStates,
          [member.name]: { isPending: false, isSelected: true },
        });
        handleTeamUpdate(updatedTeam);

        // Deduct points when adding a team member - now tournament specific
        dispatch(
          updateTournamentTeamSelectionPoints({
            tournamentId: tourId as string,
            points: -(member.points || 250),
          })
        );

        toast.success(
          `Added ${member.name} to your team. -${member.points || 250} points.`
        );

        // Show points info when a team member is added
        setShowPointsInfo(true);
        setTimeout(() => setShowPointsInfo(false), 3000);
      }, 800);
    }
  };

  const getMemberState = (member: Team): SelectionState => {
    return (
      selectionStates[member.name] || { isPending: false, isSelected: false }
    );
  };

  // Check if we can afford this team member
  const canAfford = (member: Team): boolean => {
    const memberPoints = member.points || 250;
    return (
      tournamentTeamSelectionPoints >= memberPoints ||
      getMemberState(member).isSelected
    );
  };

  return (
    <div className="pl-8 md:pl-16 lg:pl-24">
      {/* Overlay */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 h-full w-full z-10"
          />
        )}
      </AnimatePresence>

      {/* Expanded Card View */}
      <AnimatePresence>
        {active && (
          <div className="fixed left-8 md:left-16 lg:left-24 top-0 flex items-start z-[100] p-4 h-full">
            <motion.button
              key={`close-${active.name}-${id}`}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.05 } }}
              className="flex absolute top-2 right-2 lg:hidden items-center justify-center bg-white rounded-full h-6 w-6"
              onClick={() => setActive(null)}
            >
              <CloseIcon />
            </motion.button>

            <motion.div
              layoutId={`card-${active.name}-${id}`}
              ref={ref}
              className="w-full max-w-[400px] h-full flex flex-col bg-white dark:bg-neutral-900 rounded-xl overflow-hidden shadow-xl"
            >
              <motion.div layoutId={`image-${active.name}-${id}`}>
                <Image
                  priority
                  width={200}
                  height={200}
                  src={active.image}
                  alt={active.name}
                  className="w-full h-80 lg:h-80 object-cover object-top"
                />
              </motion.div>

              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <motion.h3
                      layoutId={`title-${active.name}-${id}`}
                      className="font-bold text-neutral-700 dark:text-neutral-200"
                    >
                      {active.name}
                    </motion.h3>
                    <motion.p
                      layoutId={`description-${active.description}-${id}`}
                      className="text-neutral-600 dark:text-neutral-400"
                    >
                      {active.description}
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-2 font-bold text-purple-600 dark:text-purple-400"
                    >
                      Cost: {active.points || 250} points
                    </motion.div>
                  </div>

                  <motion.button
                    layoutId={`button-${active.name}-${id}`}
                    onClick={() => {
                      if (
                        canAfford(active) ||
                        getMemberState(active).isSelected
                      ) {
                        handleTeamSelection(active);
                        setTimeout(() => setActive(null), 800);
                      }
                    }}
                    className={`relative px-4 py-3 text-sm rounded-full font-bold 
                      ${
                        getMemberState(active).isSelected
                          ? "bg-red-500 text-white"
                          : getMemberState(active).isPending
                          ? "bg-yellow-500 text-white"
                          : "bg-green-500 text-white"
                      } 
                      ${
                        !canAfford(active) && !getMemberState(active).isSelected
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    disabled={
                      !canAfford(active) && !getMemberState(active).isSelected
                    }
                  >
                    {getMemberState(active).isSelected
                      ? "Remove from Team"
                      : getMemberState(active).isPending
                      ? "Adding to Team..."
                      : "Add to Team"}

                    {getMemberState(active).isPending && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-yellow-500 opacity-20"
                        animate={{
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                        }}
                      />
                    )}
                  </motion.button>
                </div>

                <div className="pt-4 relative">
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-neutral-600 text-xs md:text-sm lg:text-base h-40 md:h-fit pb-10 flex flex-col items-start gap-4 overflow-auto dark:text-neutral-400 [mask:linear-gradient(to_bottom,white,white,transparent)]"
                  >
                    {active.description}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Section Header - Removed Premium and Tournament Points from here */}
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
          {sectionName}
        </h2>

        {/* Points info only shows when users interact with team selection */}
        <AnimatePresence>
          {showPointsInfo && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 px-4 py-2 rounded-full"
            >
              <span className="text-purple-600 dark:text-purple-400 font-medium">
                Points Remaining:
              </span>
              <span className="text-purple-800 dark:text-purple-300 font-bold">
                {tournamentTeamSelectionPoints}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Team List - Removed Selected Team Members counter */}
      <div className="transition-colors duration-300 rounded-xl p-4">
        <ul className="max-w-2xl w-full gap-4">
          {teams.map((member) => (
            <motion.div
              layoutId={`card-${member.name}-${id}`}
              key={`card-${member.name}-${id}`}
              onClick={() =>
                canAfford(member) || getMemberState(member).isSelected
                  ? setActive(member)
                  : null
              }
              className={`p-4 flex flex-col md:flex-row justify-between items-center rounded-xl cursor-pointer 
                ${
                  getMemberState(member).isSelected
                    ? "bg-green-50 dark:bg-green-900"
                    : !canAfford(member)
                    ? "bg-red-50/50 dark:bg-red-900/20"
                    : "hover:bg-neutral-50 dark:hover:bg-neutral-800"
                } 
                ${
                  !canAfford(member) && !getMemberState(member).isSelected
                    ? "opacity-70 cursor-not-allowed"
                    : ""
                }`}
            >
              <div className="flex gap-4 flex-col md:flex-row">
                <motion.div layoutId={`image-${member.name}-${id}`}>
                  <Image
                    width={100}
                    height={100}
                    src={member.image}
                    alt={member.name}
                    className="h-40 w-40 md:h-14 md:w-14 rounded-lg object-cover object-top"
                  />
                </motion.div>

                <div>
                  <motion.h3
                    layoutId={`title-${member.name}-${id}`}
                    className="font-medium text-neutral-800 dark:text-neutral-200 text-center md:text-left"
                  >
                    {member.name}
                  </motion.h3>
                  <motion.p
                    layoutId={`description-${member.description}-${id}`}
                    className="text-neutral-600 dark:text-neutral-400 text-center md:text-left"
                  >
                    {member.description}
                  </motion.p>
                  <div className="text-purple-600 dark:text-purple-400 font-medium text-sm mt-1">
                    {member.points || 250} points
                  </div>
                </div>
              </div>

              <motion.button
                layoutId={`button-${member.name}-${id}`}
                className={`px-4 py-2 text-sm rounded-full font-bold mt-4 md:mt-0
                  ${
                    getMemberState(member).isSelected
                      ? "bg-red-500 text-white"
                      : !canAfford(member)
                      ? "bg-gray-300 text-gray-500 dark:bg-gray-700"
                      : "bg-gray-100 hover:bg-green-500 hover:text-white text-black"
                  }
                  ${
                    !canAfford(member) && !getMemberState(member).isSelected
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (canAfford(member) || getMemberState(member).isSelected) {
                    if (getMemberState(member).isSelected) {
                      handleTeamSelection(member);
                    } else {
                      setActive(member);
                    }
                  }
                }}
                disabled={
                  !canAfford(member) && !getMemberState(member).isSelected
                }
              >
                {getMemberState(member).isSelected ? "Remove" : "Select"}
              </motion.button>
            </motion.div>
          ))}
        </ul>
      </div>
    </div>
  );
}

export const CloseIcon = () => {
  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.05 } }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-black"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  );
};
