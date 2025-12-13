// import { X, CheckCircle } from "lucide-react";
// import { useState } from "react";

// export default function FeedbackPopup({ onClose, onSubmit }) {
//   const [name, setName] = useState("");
//   const [rating, setRating] = useState(0);
//   const [hover, setHover] = useState(null);
//   const [feedback, setFeedback] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [success, setSuccess] = useState(false);

//   const ratingEmojis = {
//     1: { emoji: "😠", label: "Very Bad" },
//     2: { emoji: "😕", label: "Not Good" },
//     3: { emoji: "😐", label: "Average" },
//     4: { emoji: "🙂", label: "Good" },
//     5: { emoji: "🤩", label: "Excellent!" },
//   };

//   const handleSubmit = async () => {
//     if (!rating) return alert("Please select a rating!");
//     setLoading(true);

//     await onSubmit({ name, rating, feedback });

//     setLoading(false);
//     setSuccess(true);

//     setTimeout(() => {
//       onClose();
//     }, 1300);
//   };

//   return (
//     <div className="fixed inset-0 flex items-center justify-center z-[999] backdrop-blur-md bg-black/40 animate-fade-in">

//       {/* FLOATING GLASS CARD */}
//       <div className={`relative w-[90%] max-w-md p-6 rounded-2xl border border-white/20 shadow-2xl 
//         bg-white/10 backdrop-blur-xl transition-all 
//         ${success ? "scale-95 bg-green-500/20" : "animate-floating"}`
//       }>

//         {/* CLOSE BUTTON */}
//         {!success && (
//           <div className="absolute top-4 right-4">
//             <X className="text-white cursor-pointer" onClick={onClose} />
//           </div>
//         )}

//         {/* SUCCESS ANIMATION */}
//         {success ? (
//           <div className="flex flex-col items-center justify-center py-10 text-white">
//             <CheckCircle className="text-green-400 w-16 h-16 animate-success-pulse" />
//             <p className="mt-4 text-lg font-semibold">Feedback Submitted!</p>
//           </div>
//         ) : (
//           <>
//             {/* HEADER */}
//             <h2 className="text-xl font-semibold text-white mb-5">We value your feedback</h2>

//             {/* NAME */}
//             <input
//               type="text"
//               placeholder="Your Name (optional)"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               className="w-full p-2 mb-4 rounded bg-white/10 text-white border border-white/20"
//             />

//             {/* RATING */}
//             <div className="flex items-center justify-between">
//               {/* STARS */}
//               <div className="flex space-x-1">
//                 {[1, 2, 3, 4, 5].map((star) => (
//                   <span
//                     key={star}
//                     onMouseEnter={() => setHover(star)}
//                     onMouseLeave={() => setHover(null)}
//                     onClick={() => setRating(star)}
//                     className={`text-3xl cursor-pointer transition-transform duration-200
//                       ${(hover || rating) >= star ? "text-yellow-400 scale-110" : "text-gray-500"}
//                     `}
//                   >
//                     ★
//                   </span>
//                 ))}
//               </div>

//               {/* EMOJI + LABEL (SHOW ON HOVER ONLY) */}
//               {(hover || rating) >0 && (
//                 <div className="flex items-center space-x-2 text-white animate-fade-slide">
//                   <span className="text-3xl">{ratingEmojis[hover||rating].emoji}</span>
//                   <span className="text-sm">{ratingEmojis[hover||rating].label}</span>
//                 </div>
//               )}

//             </div>

//             {/* FEEDBACK TEXT */}
//             <textarea
//               placeholder="Write your feedback..."
//               rows={4}
//               value={feedback}
//               onChange={(e) => setFeedback(e.target.value)}
//               className="w-full p-2 mt-4 rounded bg-white/10 text-white border border-white/20"
//             ></textarea>

//             {/* SUBMIT */}
//             <button
//               onClick={handleSubmit}
//               disabled={loading}
//               className="mt-4 w-full bg-white/20 backdrop-blur-md text-white py-2 font-semibold rounded-xl 
//               border border-white/30 hover:bg-white/30 transition cursor-pointer"
//             >
//               {loading ? "Sending..." : "Submit Feedback"}
//             </button>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }


import { X } from "lucide-react";
import { useState } from "react";

export default function FeedbackPopup({ onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [audioType, setAudioType] = useState("3D");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const ratingLabels = {
    1: "Very Bad 😖",
    2: "Bad 😕",
    3: "Okay 🙂",
    4: "Good 😄",
    5: "Excellent 🤩"
  };

  const selectedLabel = hoverRating || rating;

  const handleSubmit = async () => {
    if (!rating) return alert("Please select a rating.");

    setLoading(true);
    const res = await onSubmit({ name, rating, message, audioType });
    setLoading(false);
    setSuccess(true);

    if (res?.success) {
      setTimeout(() => {
        onClose();
      }, 1500);
    } 
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[999]">
      <div className="bg-[#0d1117] w-[90%] max-w-md p-6 rounded-xl shadow-xl border border-white/10 animate-slide-up">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">We value your feedback</h2>
          <X className="text-white cursor-pointer" onClick={onClose} />
        </div>

        {/* Name */}
        <input
          type="text"
          placeholder="Your Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-white/10 text-white border border-white/20"
        />

        {/* Audio Effect Type */}
        <label className="text-white text-sm">Audio Effect Used</label>
        <select
          className="w-full p-2 mt-1 mb-3 rounded bg-white/10 text-white border border-white/20"
          value={audioType}
          onChange={(e) => setAudioType(e.target.value)}
        >
          <option className="text-black" value="3D">3D</option>
          <option className="text-black" value="8D">8D</option>
          <option className="text-black" value="16d">16d</option>
          <option className="text-black" value="Other">Other</option>
        </select>

        {/* Rating Section */}
        <label className="text-white text-sm">Rating</label>
        <div className="flex items-center space-x-2 mt-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className={`text-3xl cursor-pointer transition transform hover:scale-125 
                ${star <= (hoverRating || rating) ? "text-yellow-400" : "text-gray-500"}`}
            >
              ★
            </span>
          ))}
        </div>

        {/* Rating Label + Emoji */}
        <p className="text-yellow-300 text-sm h-5 transition mb-2">
          {selectedLabel ? ratingLabels[selectedLabel] : ""}
        </p>

        {/* Feedback Box */}
        <textarea
          placeholder="Write your feedback..."
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-2 rounded bg-white/10 text-white border border-white/20"
        ></textarea>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className=" cursor-pointer mt-4 w-full bg-[#7dd3fc] text-black py-2 font-semibold rounded-lg hover:bg-[#6ac8ea]"
        >
          {loading ? "Sending..." : "Submit Feedback"}
        </button>
        
      </div>
    </div>
  );
}

