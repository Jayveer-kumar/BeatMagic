import { useState } from "react"
import AlertMessage from "../components/Alert";
import EmailSenderLoader from "../components/EmailSenderLoader";
export default function Contact(){
  let initialFormData = {
    name:"",
    email:"",
    message:""
  }
  const [formData, setFormData] = useState(initialFormData);
  const [ errors , setErrors ] = useState({});
  const [ alert , setAlert ] = useState({
      open:false,
      type:"success",
      message:""
  })

  const [ visibleLoader , setVisibleLoader ] = useState(false);

  const handleInputChanges = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // clear error when user type something
    if (errors[name]) {
        setErrors((prev) => ({
            ...prev,
            [name]: ""
        }));
    }
  };

  const validateForm = ()=>{
    let newErrors = {};
    if(!formData.name.trim()){
      newErrors.name="Name is required";
    }
    if (!formData.email.trim()) {
        newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Email is invalid";
    }
    if (!formData.message.trim()) {
        newErrors.message = "Message is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = async (e)=>{
    e.preventDefault();
    if(validateForm()){
      try {
        setVisibleLoader(true);
        let res = await fetch("http://localhost:8080/api/email/sendEmail", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          setAlert({
            open:true,
            type:"success",
            message: data.message || " Email Sended SuccessFully!"
          })
          setFormData(initialFormData);
        } else {
          // Error Alert
          setAlert({
            open:true,
            type:"error",
            message : data.message || "Some Error while Sending Email"
          })
        }
      } catch (error) {
        console.error("Some Error While Sending Email : ", error);
        setAlert({
            open:true,
            type:"error",
            message : "Some Error while Sending Email"
          })
      } finally{
        setVisibleLoader(false);
      }
    }
  }

  const isFormValid = formData.name.trim() && formData.email.trim() && formData.message.trim();

  return (
    <section id="Contact" className=" px-5 w-full py-28 bg-black text-white">
      <div className="max-w-screen-2xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* LEFT SIDE TEXT */}
          <div>
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
              Have a Question?
              <span className="block text-[#4f9cff]">We’re Here to Help.</span>
            </h2>

            <p className="text-gray-300 mb-12 max-w-md">
              Whether you're facing an issue, want a new feature, or just want
              to appreciate the tool — feel free to reach out.
            </p>

            <div className="space-y-4 text-gray-300">
              <p className="flex items-center gap-3">
                <span className="text-[#4f9cff] text-xl">📧</span>
                Jayveerk394@gmail.com
              </p>
              <p className="flex items-center gap-3">
                <span className="text-[#4f9cff] text-xl">🌐</span>
                www.BeatMagic.com
              </p>
            </div>
          </div>

          {/* RIGHT SIDE FORM */}
          <div className="p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
            <form className="space-y-6" onSubmit={handleSubmit} >
              {/* Name */}
              <div>
                <label className="block mb-1 text-gray-300">Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChanges}
                  placeholder="Enter your name"
                  className="w-full px-3 py-3 bg-white/10 text-white rounded-xl border border-white/10 focus:ring-2 focus:ring-[#4f9cff] focus:outline-none"
                />
                {errors.name && <span className="text-red-500 text-sm">{errors.name}</span>}
              </div>

              {/* Email */}
              <div>
                <label className="block mb-1 text-gray-300">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChanges}
                  placeholder="your@email.com"
                  className="w-full px-3 py-3 bg-white/10 text-white rounded-xl border border-white/10 focus:ring-2 focus:ring-[#4f9cff] focus:outline-none"
                />
                {errors.email && <span className="text-red-500 text-sm">{errors.email}</span>}
              </div>

              {/* Message */}
              <div>
                <label className="block mb-1 text-gray-300">Message</label>
                <textarea
                  rows="4"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChanges}
                  placeholder="Write your message..."
                  className="w-full px-3 py-3 bg-white/10 text-white rounded-xl border border-white/10 focus:ring-2 focus:ring-[#4f9cff] focus:outline-none"
                ></textarea>
                {errors.message && <span className="text-red-500 text-sm">{errors.message}</span>}
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={!isFormValid}
                className={` w-full py-3 ${!isFormValid ? `bg-gray-400 cursor-not-allowed` : `bg-[#4f9cff] hover:bg-[#70adff] cursor-pointer `}  transition text-black font-bold rounded-xl text-lg shadow-lg hover:shadow-[#4f9cff]/40 flex items-center justify-center gap-1 `}
              >
                {!visibleLoader && <span  >Send Message</span>}
                {visibleLoader && (
                  <>
                  <span className="text-white" >Sending...</span>
                  <EmailSenderLoader />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
      <AlertMessage open={alert.open} type={alert.type} message={alert.message} onClose={() => setAlert(prev => ({ ...prev, open: false }))} />
    </section>
  );
}