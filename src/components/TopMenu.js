import { useState } from 'react';
import { useRouter } from 'next/router';
import { getAuth} from 'firebase/auth';
import { app } from '../firebase/client'; 

export default function TopMenu({ user }) {
    const router = useRouter();
    const auth = getAuth(app);

    const [isProfileMenuVisible, setIsProfileMenuVisible] = useState(false);    

    const toggleProfileMenu = () => {
        setIsProfileMenuVisible(!isProfileMenuVisible);
    };

    const handleSignOut = async () => {
        try {
          auth.signOut();        
          const response = await fetch('/api/auth/signout', { method: 'POST' });
          if (response.ok) {
            // Redirect to sign-in page on successful sign-out
            router.push('/signin');
          } else {
            // Handle errors here if sign-out fails
            console.error('Failed to sign out');
          }
        } catch (error) {
          console.error('Error signing out:', error);
        }
    };    
    
    return(
        <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-4 item-center">Welcome {user.displayName}, happy to see you here!</div>
            <div className="flex items-center space-x-3">
                <div className="bg-white p-2 rounded-full text-gray-400 hover:text-gray-500">
                    <i className="fas fa-bell"></i>
                </div>
                <div className="bg-white p-2 rounded-full text-gray-400 hover:text-gray-500">
                    <i className="fas fa-cog"></i>
                </div>
                <div onClick={toggleProfileMenu} className="relative">
                    <img src="https://placehold.co/32x32" alt="User profile placeholder image" className="rounded-full cursor-pointer"/>
                    <div id="profile-menu" className={`${isProfileMenuVisible ? '' : 'hidden'} absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-xl z-20`}>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Your Profile</a>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={handleSignOut}>Sign out</a>
                    </div>
                </div>
            </div>
        </div>  
    );

}