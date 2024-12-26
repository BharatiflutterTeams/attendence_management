import React, { useEffect , useState} from 'react'
import Sidenav from '../components/Sidenav'
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography'
import Toolbar from '@mui/material/Toolbar';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

function Home() {
  const [greeting, setGreeting] = useState('');
  const Navigate = useNavigate();
  useEffect(()=>{checkAuth()},[])


  const checkAuth = ()=>{
    const token = sessionStorage.getItem('jwtToken')

    if( token && token !== '' && token !== null){
    const decoded = jwtDecode(token);
    const role = decoded.role
    if(role == 'checker'){
      Navigate('/scanner');
    }
   
   }
   else{
      console.log('Token not Found');
      Navigate('/login');
   }
}

useEffect(() => {
  const getGreeting = () => {
    const currentHour = new Date().getHours();

    if (currentHour < 12) {
      return 'Hello, Good Morning';
    } else if (currentHour < 18) {
      return 'Hello, Good Afternoon';
    } else {
      return 'Hello, Good Evening';
    }
  };

  setGreeting(getGreeting());

  const timerId = setInterval(() => {
    setGreeting(getGreeting());
  }, 60000); // Update the greeting every minute

  return () => clearInterval(timerId);
}, []);


  return (
    <>
    <Navbar/>
    <Box sx={{ display: 'flex' }}>
    
      <Sidenav/>

    <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        <h1> {'👋'}{greeting}{" "}</h1>
        <h4>To access the dashboard get premium subscription</h4>

        {/* <Card sx={{ maxWidth: 345 }} /> */}
      </Box>
    </Box>
    </>
  )
}

export default Home