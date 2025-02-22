"use client";
import Image from "next/image";
import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { setTeams } from "@/store/teamsSlice";
import { useDispatch } from "react-redux";

interface Card {
  title: string;
  description: string;
  src: string;
  content: () => React.ReactNode | string;
}

type SelectionState = {
  isPending: boolean;
  isSelected: boolean;
};

interface SelectionMap {
  [key: string]: SelectionState;
}

interface InfluencersTeamSectionProps {
  sectionName: string;
}

export function InfluencersTeamSection({
  sectionName,
}: InfluencersTeamSectionProps) {
  const [active, setActive] = useState<Card | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Card[]>([]);
  const [selectionStates, setSelectionStates] = useState<SelectionMap>({});
  const ref = useRef<HTMLDivElement>(null!);
  const id = useId();

  const isTeamFull = selectedTeam.length >= 4;
  const dispatch = useDispatch();

  const handleTeamUpdate = (selectedTeam: Card[]) => {
    dispatch(
      setTeams({
        sectionName,
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

  // const handleTeamSelection = (card: Card) => {
  //   const currentState = selectionStates[card.title] || {
  //     isPending: false,
  //     isSelected: false,
  //   };

  //   if (currentState.isSelected) {
  //     // Remove from team
  //     setSelectedTeam(
  //       selectedTeam.filter((member) => member.title !== card.title)
  //     );
  //     setSelectionStates({
  //       ...selectionStates,
  //       [card.title]: { isPending: false, isSelected: false },
  //     });
  //   } else {
  //     // Start selection process
  //     setSelectionStates({
  //       ...selectionStates,
  //       [card.title]: { isPending: true, isSelected: false },
  //     });

  //     // Animate and then add to team after delay
  //     setTimeout(() => {
  //       if (!isTeamFull) {
  //         setSelectedTeam([...selectedTeam, card]);
  //         setSelectionStates({
  //           ...selectionStates,
  //           [card.title]: { isPending: false, isSelected: true },
  //         });
  //       }
  //     }, 800);
  //   }
  // };

  const handleTeamSelection = (card: Card) => {
    const currentState = selectionStates[card.title] || {
      isPending: false,
      isSelected: false,
    };

    if (currentState.isSelected) {
      // Remove from team
      const updatedTeam = selectedTeam.filter(
        (member) => member.title !== card.title
      );
      setSelectedTeam(updatedTeam);
      setSelectionStates({
        ...selectionStates,
        [card.title]: { isPending: false, isSelected: false },
      });
      // Update the team in the store
      handleTeamUpdate(updatedTeam);
    } else {
      // Start selection process
      setSelectionStates({
        ...selectionStates,
        [card.title]: { isPending: true, isSelected: false },
      });

      // Animate and then add to team after delay
      setTimeout(() => {
        if (!isTeamFull) {
          const updatedTeam = [...selectedTeam, card];
          setSelectedTeam(updatedTeam);
          setSelectionStates({
            ...selectionStates,
            [card.title]: { isPending: false, isSelected: true },
          });
          // Update the team in the store
          handleTeamUpdate(updatedTeam);
        }
      }, 800);
    }
  };

  const getCardState = (card: Card): SelectionState => {
    return (
      selectionStates[card.title] || { isPending: false, isSelected: false }
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
              key={`close-${active.title}-${id}`}
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
              layoutId={`card-${active.title}-${id}`}
              ref={ref}
              className="w-full max-w-[400px] h-full flex flex-col bg-white dark:bg-neutral-900 rounded-xl overflow-hidden shadow-xl"
            >
              <motion.div layoutId={`image-${active.title}-${id}`}>
                <Image
                  priority
                  width={200}
                  height={200}
                  src={active.src}
                  alt={active.title}
                  className="w-full h-80 lg:h-80 object-cover object-top"
                />
              </motion.div>

              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <motion.h3
                      layoutId={`title-${active.title}-${id}`}
                      className="font-bold text-neutral-700 dark:text-neutral-200"
                    >
                      {active.title}
                    </motion.h3>
                    <motion.p
                      layoutId={`description-${active.description}-${id}`}
                      className="text-neutral-600 dark:text-neutral-400"
                    >
                      {active.description}
                    </motion.p>
                  </div>

                  <motion.button
                    layoutId={`button-${active.title}-${id}`}
                    onClick={() => {
                      if (!isTeamFull || getCardState(active).isSelected) {
                        handleTeamSelection(active);
                        setTimeout(() => setActive(null), 800);
                      }
                    }}
                    className={`relative px-4 py-3 text-sm rounded-full font-bold 
                      ${
                        getCardState(active).isSelected
                          ? "bg-red-500 text-white"
                          : getCardState(active).isPending
                          ? "bg-yellow-500 text-white"
                          : "bg-green-500 text-white"
                      } 
                      ${
                        isTeamFull && !getCardState(active).isSelected
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    disabled={isTeamFull && !getCardState(active).isSelected}
                  >
                    {getCardState(active).isSelected
                      ? "Remove from Team"
                      : getCardState(active).isPending
                      ? "Adding to Team..."
                      : "Add to Team"}

                    {getCardState(active).isPending && (
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
                    {typeof active.content === "function"
                      ? active.content()
                      : active.content}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Team List */}
      <div
        className={`transition-colors duration-300 ${
          isTeamFull ? "bg-neutral-100 dark:bg-neutral-800" : ""
        } rounded-xl p-4`}
      >
        <div className="mb-4">
          <p className="text-neutral-600 dark:text-neutral-400">
            Selected Team Members: {selectedTeam.length}/4
          </p>
        </div>

        <ul className="max-w-2xl w-full gap-4">
          {cards.map((card) => (
            <motion.div
              layoutId={`card-${card.title}-${id}`}
              key={`card-${card.title}-${id}`}
              onClick={() =>
                !isTeamFull || getCardState(card).isSelected
                  ? setActive(card)
                  : null
              }
              className={`p-4 flex flex-col md:flex-row justify-between items-center rounded-xl cursor-pointer 
                ${
                  getCardState(card).isSelected
                    ? "bg-green-50 dark:bg-green-900"
                    : "hover:bg-neutral-50 dark:hover:bg-neutral-800"
                } 
                ${
                  isTeamFull && !getCardState(card).isSelected
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
            >
              <div className="flex gap-4 flex-col md:flex-row">
                <motion.div layoutId={`image-${card.title}-${id}`}>
                  <Image
                    width={100}
                    height={100}
                    src={card.src}
                    alt={card.title}
                    className="h-40 w-40 md:h-14 md:w-14 rounded-lg object-cover object-top"
                  />
                </motion.div>

                <div>
                  <motion.h3
                    layoutId={`title-${card.title}-${id}`}
                    className="font-medium text-neutral-800 dark:text-neutral-200 text-center md:text-left"
                  >
                    {card.title}
                  </motion.h3>
                  <motion.p
                    layoutId={`description-${card.description}-${id}`}
                    className="text-neutral-600 dark:text-neutral-400 text-center md:text-left"
                  >
                    {card.description}
                  </motion.p>
                </div>
              </div>

              <motion.button
                layoutId={`button-${card.title}-${id}`}
                className={`px-4 py-2 text-sm rounded-full font-bold mt-4 md:mt-0
                  ${
                    getCardState(card).isSelected
                      ? "bg-red-500 text-white"
                      : "bg-gray-100 hover:bg-green-500 hover:text-white text-black"
                  }
                  ${
                    isTeamFull && !getCardState(card).isSelected
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isTeamFull || getCardState(card).isSelected) {
                    if (getCardState(card).isSelected) {
                      handleTeamSelection(card);
                    } else {
                      setActive(card);
                    }
                  }
                }}
                disabled={isTeamFull && !getCardState(card).isSelected}
              >
                {getCardState(card).isSelected ? "Remove" : "Select"}
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
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
        transition: {
          duration: 0.05,
        },
      }}
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

const cards = [
  {
    description: "Lana Del Rey",
    title: "Summertime Sadness",
    src: "https://assets.aceternity.com/demos/lana-del-rey.jpeg",
    ctaText: "Play",
    ctaLink: "https://ui.aceternity.com/templates",
    content: () => {
      return (
        <p>
          Lana Del Rey, an iconic American singer-songwriter, is celebrated for
          her melancholic and cinematic music style. Born Elizabeth Woolridge
          Grant in New York City, she has captivated audiences worldwide with
          her haunting voice and introspective lyrics. <br /> <br /> Her songs
          often explore themes of tragic romance, glamour, and melancholia,
          drawing inspiration from both contemporary and vintage pop culture.
          With a career that has seen numerous critically acclaimed albums, Lana
          Del Rey has established herself as a unique and influential figure in
          the music industry, earning a dedicated fan base and numerous
          accolades.
        </p>
      );
    },
  },

  {
    description: "Babbu Maan",
    title: "Mitran Di Chhatri",
    src: "https://assets.aceternity.com/demos/babbu-maan.jpeg",
    ctaText: "Play",
    ctaLink: "https://ui.aceternity.com/templates",
    content: () => {
      return (
        <p>
          Babu Maan, a legendary Punjabi singer, is renowned for his soulful
          voice and profound lyrics that resonate deeply with his audience. Born
          in the village of Khant Maanpur in Punjab, India, he has become a
          cultural icon in the Punjabi music industry. <br /> <br /> His songs
          often reflect the struggles and triumphs of everyday life, capturing
          the essence of Punjabi culture and traditions. With a career spanning
          over two decades, Babu Maan has released numerous hit albums and
          singles that have garnered him a massive fan following both in India
          and abroad.
        </p>
      );
    },
  },

  {
    description: "Metallica",
    title: "For Whom The Bell Tolls",
    src: "https://assets.aceternity.com/demos/metallica.jpeg",
    ctaText: "Play",
    ctaLink: "https://ui.aceternity.com/templates",
    content: () => {
      return (
        <p>
          Metallica, an iconic American heavy metal band, is renowned for their
          powerful sound and intense performances that resonate deeply with
          their audience. Formed in Los Angeles, California, they have become a
          cultural icon in the heavy metal music industry. <br /> <br /> Their
          songs often reflect themes of aggression, social issues, and personal
          struggles, capturing the essence of the heavy metal genre. With a
          career spanning over four decades, Metallica has released numerous hit
          albums and singles that have garnered them a massive fan following
          both in the United States and abroad.
        </p>
      );
    },
  },
  {
    description: "Led Zeppelin",
    title: "Stairway To Heaven",
    src: "https://assets.aceternity.com/demos/led-zeppelin.jpeg",
    ctaText: "Play",
    ctaLink: "https://ui.aceternity.com/templates",
    content: () => {
      return (
        <p>
          Led Zeppelin, a legendary British rock band, is renowned for their
          innovative sound and profound impact on the music industry. Formed in
          London in 1968, they have become a cultural icon in the rock music
          world. <br /> <br /> Their songs often reflect a blend of blues, hard
          rock, and folk music, capturing the essence of the 1970s rock era.
          With a career spanning over a decade, Led Zeppelin has released
          numerous hit albums and singles that have garnered them a massive fan
          following both in the United Kingdom and abroad.
        </p>
      );
    },
  },
  {
    description: "Mustafa Zahid",
    title: "Toh Phir Aao",
    src: "https://assets.aceternity.com/demos/toh-phir-aao.jpeg",
    ctaText: "Play",
    ctaLink: "https://ui.aceternity.com/templates",
    content: () => {
      return (
        <p>
          &quot;Aawarapan&quot;, a Bollywood movie starring Emraan Hashmi, is
          renowned for its intense storyline and powerful performances. Directed
          by Mohit Suri, the film has become a significant work in the Indian
          film industry. <br /> <br /> The movie explores themes of love,
          redemption, and sacrifice, capturing the essence of human emotions and
          relationships. With a gripping narrative and memorable music,
          &quot;Aawarapan&quot; has garnered a massive fan following both in
          India and abroad, solidifying Emraan Hashmi&apos;s status as a
          versatile actor.
        </p>
      );
    },
  },
];
