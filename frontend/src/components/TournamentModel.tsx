import React from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalTrigger,
} from "./ui/animated-modal";
import PlatformCard from "./Cards";

export function TournamentModal() {
  return (
    <div>
      <Modal>
        <ModalTrigger className="bg-black dark:bg-white dark:text-black text-white flex justify-center items-center group/modal-btn rounded-full w-32 h-14 shadow-lg hover:shadow-xl transition-all overflow-hidden relative">
          <span className="absolute group-hover/modal-btn:translate-x-32 text-center transition-transform duration-500">
            Tournaments
          </span>
          <div className="-translate-x-32 group-hover/modal-btn:translate-x-0 flex items-center justify-center absolute inset-0 transition-transform duration-500 text-2xl">
            🏆
          </div>
        </ModalTrigger>
        <ModalBody className="p-0 ">
          <ModalContent className="w-[90vw] h-[85vh] max-w-6xl max-h-[85vh] bg-gradient-to-br from-gray-900 to-black overflow-auto">
            <div className="w-full h-full flex flex-col">
              {/* Fixed Header */}
              <div className="text-center p-8 pb-4 border-b border-gray-800 flex-shrink-0">
                <h2 className="text-3xl font-bold text-white mb-2">
                  Active Tournaments
                </h2>
                <p className="text-gray-400">
                  Join or create a team to participate in our ongoing
                  tournaments
                </p>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto scrollbar-thumb-gray-600 scrollbar-track-gray-900">
                <div className="px-4 pt-4 pb-8">
                  <div className="flex flex-wrap justify-center gap-6 items-start">
                    <div className="transform hover:-translate-y-2 transition-transform duration-300">
                      <PlatformCard
                        platform="Twitter"
                        image="https://media.istockphoto.com/id/1649927045/photo/social-media-social-media-marketing-engagement-post-structure.jpg?s=1024x1024&w=is&k=20&c=L_qdR5o6diw78hc7dSE4SML5tiNPoYVJihGKSe_2cTw="
                        icon="https://img.freepik.com/premium-vector/twitter-new-x-logo-design-vector_1340851-70.jpg"
                        timeRemaining={1380}
                      />
                    </div>
                    <div className="transform hover:-translate-y-2 transition-transform duration-300">
                      <PlatformCard
                        platform="Instagram"
                        image="https://cdn.pixabay.com/photo/2016/06/22/22/13/instagram-1474233_1280.jpg"
                        icon="https://img.freepik.com/premium-vector/instagram-logo_976174-11.jpg"
                        timeRemaining={1260}
                      />
                    </div>
                    <div className="transform hover:-translate-y-2 transition-transform duration-300">
                      <PlatformCard
                        platform="TikTok"
                        image="https://cdn.pixabay.com/photo/2020/04/19/15/14/tiktok-5064078_1280.jpg"
                        icon="https://img.freepik.com/free-psd/tiktok-logo-icon-psd-editable_314999-3664.jpg"
                        timeRemaining={1440}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="p-8 pt-4 border-t border-gray-800 text-center flex-shrink-0">
                <p className="text-gray-400 text-sm">
                  New tournaments are added weekly. Stay tuned for more
                  opportunities!
                </p>
              </div>
            </div>
          </ModalContent>
        </ModalBody>
      </Modal>
    </div>
  );
}

export default TournamentModal;
