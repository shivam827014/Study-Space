"use client";

import Clock from "@/components/Clock";
import { AddGroup, JoinGroup, BackgroundCurveSvg, FlowerIllustration, PotIllustration } from "@/components/Icons";
import Loading from "@/components/Loading";
import { useAuth } from "@/hooks/useAuth";
import { createStudyRoom } from "@/lib/studyrooms.service";
import { StudyRoomI } from "@/types/study-room";
import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import Header from "../Header";
import Notifications from "../settings/Notifications";

const CreateStudyRoomModal = dynamic(() => import("@/components/Modal/CreateStudyRoomModal"));
const JoinViaLinkModal = dynamic(() => import("@/components/Modal/JoinViaLinkModal"));

export default function Dashboard() {
  const { currentUser, loading } = useAuth();
  const userId = currentUser?.$id; // Define currentUserId

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openJoinModal, setOpenJoinModal] = useState(false);
  const [successfullyCreated, setSuccessfullyCreated] = useState(false);

  const _createStudyRoom = useCallback(
    async (studyRoom: StudyRoomI) => {
      try {
        const newStudyRoom = await createStudyRoom({
          ...studyRoom,
          userId,
        });
        if (newStudyRoom?.$id) setSuccessfullyCreated(true);
        else toast.error("Study room creation failed");
      } catch (err: any) {
        toast.error(err.message);
      }
    },
    [userId] // Correct dependency
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col p-8">
      <Header currentUser={currentUser} className="hidden md:flex" />
      <div className="flex flex-wrap gap-y-6 gap-x-16 md:pl-6">
        <div className="w-full sm:w-52 h-52 flex flex-col justify-between sm:flex-1 bg-orange shadow-lg rounded-lg p-7 cursor-pointer" onClick={() => setOpenCreateModal(true)}>
          <AddGroup />
          <div>
            <p className="text-white text-lg font-semibold">New Room</p>
            <p className="text-white">Set up new room</p>
          </div>
        </div>

        <div className="w-full sm:w-52 h-52 flex flex-col justify-between sm:flex-1 bg-purple shadow-lg rounded-lg p-7 cursor-pointer" onClick={() => setOpenJoinModal(true)}>
          <JoinGroup />
          <div>
            <p className="text-white text-lg font-semibold">Join Room</p>
            <p className="text-white">Via invitation link</p>
          </div>
        </div>
      </div>

      <CreateStudyRoomModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onCreateChatRoom={_createStudyRoom}
        sucessfulCreation={successfullyCreated}
      />

      <JoinViaLinkModal
        open={openJoinModal}
        onClose={() => setOpenJoinModal(false)}
        currentUserId={userId} // Pass currentUserId to the modal
        onJoinSuccess={() => {
          toast.success("Successfully joined the study room!");
          setOpenJoinModal(false);
        }}
        onJoinFailure={(error) => {
          toast.error(`Failed to join the study room: ${error.message}`);
        }}
      />

      <div className="w-full mt-6 max-w-md ml-auto">
        <Notifications from="dashboard" />
      </div>
    </div>
  );
}
