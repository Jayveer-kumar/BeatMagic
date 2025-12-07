import nodemailer from 'nodemailer';

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

        // Nodemailer transporter setup
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Ya koi bhi email service (gmail, outlook, etc.)
            auth: {
                user: process.env.EMAIL_USER, // Tumhara email
                pass: process.env.EMAIL_PASS  // App password (not regular password)
            }
        });

        // Email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, 
            replyTo:email,
            subject: `New Contact Form Message from ${name}`,
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
        };

        // Send Email
        await transporter.sendMail(mailOptions);

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
