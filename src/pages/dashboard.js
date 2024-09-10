// pages/dashboard.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
//import { getAuth } from "firebase-admin/auth";
//import { app } from "../firebase/server"; // Adjust this import for server-side Firebase
import { getAuth} from 'firebase/auth';
import { app } from '../firebase/client'; 

export default function Dashboard({user}) {
    const router = useRouter();
    const auth = getAuth(app);
    const [isProfileMenuVisible, setIsProfileMenuVisible] = useState(false);
  
    useEffect(() => {
      if (!user) {
        console.log('Redirecting to signin...');        
        router.push('/signin');
      }
    }, [user, router]);

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

    const toggleProfileMenu = () => {
      setIsProfileMenuVisible(!isProfileMenuVisible);
    };

    return (
      <div>
        <Head>
            <title>2nd Brain Labs</title>
            <link rel="icon" href="/tivul-favicon.ico" />
        </Head>                 
        <div className="flex">
          <button className="p-4 text-gray-500 focus:outline-none md:hidden" id="menuButton">
            <i className="fas fa-bars">
            </i>
          </button>
          <aside className="w-64 bg-white p-6 fixed inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out" id="sidebar">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
            2nd Brain Labs
            </h1>
          </div>
          <nav className="space-y-1">
            <a className="block py-2.5 px-4 rounded hover:bg-blue-500 hover:text-white" href="#">
            Start
            </a>
            <a className="block py-2.5 px-4 rounded hover:bg-blue-500 hover:text-white" href="#">
            Recent drafts
            </a>
            <a className="block py-2.5 px-4 rounded hover:bg-blue-500 hover:text-white" href="#">
            Share history
            </a>
            <a className="block py-2.5 px-4 rounded hover:bg-blue-500 hover:text-white" href="#">
            Templates
            </a>
            <a className="block py-2.5 px-4 rounded hover:bg-blue-500 hover:text-white" href="#">
            Super tools
            </a>
          </nav>
          </aside>
          <main className="flex-1">
         
            <div className="px-10 py-8">
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

              <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">
                2nd Brain Apps
              </h1>
              <div className="flex items-center space-x-4">
              </div>
              </div>
              <div className="mt-6 mb-4">
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white shadow rounded-lg p-4">
                    <img alt="Placeholder image of a woman with video play icon overlay" className="rounded-lg mb-4" height="100" 
                      src="images/2ndbrain.png" width="300"/>
                    <h5 className="text-lg font-semibold mb-2">
                    AI Labs
                    </h5>
                    <p className="text-sm text-gray-600">
                    An AI-powered personal assistant that helps you manage your life: watch videos, read articles, take notes and make to-do lists for you. Please wait for invite in your email.
                    </p>
                  </div>
                  
                <div className="bg-white shadow rounded-lg p-4">
                  <img alt="Placeholder image of a woman with video play icon overlay" className="rounded-lg mb-4" height="100" 
                    src="images/SumMeetAppLogo.png" width="300"/>
                  <h5 className="text-lg font-semibold mb-2">
                  SumMeet
                  </h5>
                  <p className="text-sm text-gray-600">
                  Use AI to summarize your zoom meeting recordings into easily digestable and actionable key points. 
                  </p>
                </div>
                <div className="bg-white shadow rounded-lg p-4">
                  <img alt="Placeholder image of a woman with video play icon overlay" className="rounded-lg mb-4" height="100" 
                    src="images/PicGuide.png" width="300"/>
                  <h5 className="text-lg font-semibold mb-2">
                  PicGuide
                  </h5>
                  <p className="text-sm text-gray-600">
                  Send the AI a picture, and it will tell you where it is and the related travel info about this place. 
                  </p>
                </div>

              </div>
            </div>
          </main>
        </div>      


      </div>

      
    );

}


export async function getServerSideProps(context) {
    try {
        const {auth} = await import('../firebase/server');
        const sessionCookie = context.req.cookies.session;

        if (!sessionCookie) {
            console.log('session cookie empty, redirecting to signin');
            return { redirect: { destination: '/signin', permanent: false } };
        }

        const decodedCookie = await auth.verifySessionCookie(sessionCookie);
        const userRecord = await auth.getUser(decodedCookie.uid);

        if (!userRecord) {
            console.log('user record empty, redirecting to signin');
            return { redirect: { destination: '/signin', permanent: false } };
        }

        // Convert user data to a serializable object
        const user = {
        uid: userRecord.uid,
        displayName: userRecord.displayName,
        email: userRecord.email,
        // include any other user fields needed
        };

        return { props: { user } };
    } catch (error) {
        console.error(error);
        return { redirect: { destination: '/signin', permanent: false } };
    }
}