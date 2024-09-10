// pages/api/auth/signout.js
export default async function handler(req, res) {
    if (req.method === 'POST') {
      // Clear the session cookie
      res.setHeader('Set-Cookie', 'session=; Max-Age=0; Path=/; HttpOnly');
        
      // Send a response indicating successful sign out
      res.status(200).json({ message: 'Signed out successfully' });
    } else {
      // Handle any other HTTP methods
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }
  