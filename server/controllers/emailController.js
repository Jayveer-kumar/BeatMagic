import nodemailer from 'nodemailer';
import Feedback from '../models/Feedback.js';
import useragent from 'useragent';
import { Resend } from 'resend';

// Contact Form Email
export const sendEmail = async (req, res) => {
    console.log("Request Recieved : for Sending Email :  ");
    try {
        const { name, email, message } = req.body;

        // Validation
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Email validation
        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        // Resend Email Configration
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        // Send Email Using Resend
        await resend.emails.send({
            from : 'Beatmagic <onboarding@resend.dev>',
            to : [process.env.RESEND_API_KEY],
            replyTo : email,
            subject : `New Contact Form Message from ${name}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
                        <h2 style="color: #4f9cff; border-bottom: 2px solid #4f9cff; padding-bottom: 10px;">
                            New Contact Form Submission
                        </h2>
                        
                        <div style="margin: 20px 0;">
                            <p style="margin: 10px 0;"><strong>Name:</strong> ${name}</p>
                            <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
                            <p style="margin: 10px 0;"><strong>Message:</strong></p>
                            <p style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #4f9cff; margin: 10px 0;">
                                ${message}
                            </p>
                        </div>
                        
                        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
                        
                        <p style="color: #666; font-size: 12px; text-align: center;">
                            This email was sent from BeatCraft Contact Form
                        </p>
                    </div>
                </div>
            `
        })

        return res.status(200).json({
            success: true,
            message: "Email sent successfully!"
        });

    } catch (error) {
        console.error("Email send error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to send email",
            error: error.message
        });
    }
};


// FeedBack Form Email
export const sendFeedback = async (req,res)=>{
    console.log("Request Recieved for Feedback : ");
    try{
        const { name , rating , message , audioType } = req.body;
        if(!message || !rating ){
            return res.status(400).json({
                success:false,
                message:"Feedback and rating is required : "
            })
        }
        console.log("Step 1: Body OK");
        // Extract Ip & user agent
        const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress || "Unknown";
        console.log("Step 2: IP OK");
        const agent =  useragent.parse(req.headers["user-agent"]||"");
        console.log("Step 3: UserAgent OK");

        const newFeedback = await Feedback.create({
            name: name || "Anonymous",
            rating,
            message,
            audioType: audioType || "Other",
            ip,
            userAgent : agent.toString()
        })
        console.log("Step 4: DB Save OK");
        const transporter = nodemailer.createTransport({
            service:"gmail",
            auth:{
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            }
        })

        const mailOptions = {
            from : process.env.EMAIL_USER,
            to : process.env.EMAIL_USER,
            subject : `New User Feedback - Rating ${rating}⭐`,
            html:`
            <div style="font-family: Arial; padding: 20px;">
                    <h2>New Feedback Received</h2>

                    <p><strong>Name:</strong> ${name || "Anonymous"}</p>
                    <p><strong>Rating:</strong> ${"⭐".repeat(rating)}</p>

                    <p><strong>Feedback:</strong></p>
                    <p>${message}</p>

                    <hr>
                    <p style="font-size: 12px; color: gray;">This feedback came from BeatCraft App</p>
                </div>            
            `
        }
        await transporter.sendMail(mailOptions);
        console.log("Step 5: Email Sent OK");
        return res.status(200).json({
            success:true,
            message:"Feedback submitted successfully!"
        })
    }catch(err){
        console.error("Some Error Occure while Sending Feedback :",err);
        return res.status(500).json({
            success:false,
            message:"Failed to send Feedback!"
        })
    }
}
