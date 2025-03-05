import google from '../../assets/google.png';
import { GoogleAuthProvider, signInWithPopup, getAdditionalUserInfo } from 'firebase/auth';
import { auth } from '../../Firebase/FirebaseConfig';

interface GoogleProp {
    closeModal: () => void;
}

const SigninWithGoogle=({closeModal}:GoogleProp)=>{
    
    async function googleLogIn(){
        try {
            const provider=new GoogleAuthProvider();
            const result=await signInWithPopup(auth, provider);
            
            const user = result.user;
            const additionalUserInfo = getAdditionalUserInfo(result); 

            if (additionalUserInfo?.isNewUser) {
                console.log("New user signed up:", user);
            } else {
                console.log("Returning user signed in:", user);
            }

            if (user) { 
                closeModal();
            }
        } catch (error) {
            console.error("Google Sign-In Error:", error);
        }
    }

    return (
        <div>
            <p className='continue-p'>--Or Continue With--</p>
            <div className='flex justify-center cursor-pointer' onClick={googleLogIn}>
                <img src={google} width="60%" alt="Google Sign In" />
            </div>
        </div>
    );
}

export default SigninWithGoogle;
