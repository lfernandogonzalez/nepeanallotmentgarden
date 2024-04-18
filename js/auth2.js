
document.getElementById("signupForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Import the necessary modules from the Amazon Cognito SDK
    const { SignUpCommand, SignUpCommandInput } = AWS.CognitoIdentityProvider;

    // Construct the parameters for the sign-up command
    const signUpParams = {
        ClientId: "6mkmj7cfc7vd5g04cgm6lrm6ql",
        Username: email,
        Password: password,
    };

    try {
        // Call the sign-up command
        const response = await SignUpCommand.send(new SignUpCommandInput(signUpParams));
        alert("Sign-up successful! Please check your email for verification.");
        // Redirect to login page or handle verification process
    } catch (error) {
        console.error("Error signing up:", error);
        alert("Error signing up. Please try again.");
    }
});
