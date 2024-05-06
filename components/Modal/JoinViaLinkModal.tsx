import React, { useState, useRef, useEffect } from "react";
import { joinStudyRoom } from "@/lib/studyrooms.service";
import { toast } from "react-toastify";

interface JoinViaLinkModalProps {
  open: boolean;
  onClose: () => void;
  currentUserId: string; // Receive the currentUserId from props
  onJoinSuccess: () => void;
  onJoinFailure: (error: any) => void;
}

const JoinViaLinkModal: React.FC<JoinViaLinkModalProps> = ({ open, onClose, currentUserId, onJoinSuccess, onJoinFailure }) => {
  const [invitationLink, setInvitationLink] = useState("");
  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const extractInfoFromLink = (link: string) => {
    const url = new URL(link);
    const studyRoomId = url.searchParams.get("studyRoomId");
    const userId = url.searchParams.get("userId");
    const role = url.searchParams.get("role") as "user" | "owner" | "admin" || "user"; // Cast and default to "user"
  
    if (!studyRoomId || !userId) {
      throw new Error("Invalid invitation link");
    }
  
    return { studyRoomId, userId, role };
  };
  

  const handleJoinStudyRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { studyRoomId, userId, role } = extractInfoFromLink(invitationLink);

      await joinStudyRoom({ study_room_id: studyRoomId, user_id: userId, role }, currentUserId); // Pass the currentUserId to joinStudyRoom

      onJoinSuccess();
      setLoading(false);
    } catch (error) {
      onJoinFailure(error);
      setLoading(false);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800/20 backdrop-blur-lg">
      <div className="bg-white p-8 rounded-md shadow-lg w-11/12 sm:max-w-md" ref={modalRef}>
        <h2 className="text-2xl font-semibold mb-4 text-center">Join Study Room via Invitation Link</h2>
        <form className="flex flex-col gap-4 pt-4 sm:pt-8" onSubmit={handleJoinStudyRoom}>
          <input
            type="text"
            className="input text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple"
            placeholder="Enter Invitation Link"
            value={invitationLink}
            onChange={(e) => setInvitationLink(e.target.value)}
          />

          <button
            className={`btn btn-primary mt-4 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            type="submit"
            disabled={loading}
          >
            {loading ? "Joining..." : "Join"}
          </button>
        </form>

        <button
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default JoinViaLinkModal;
