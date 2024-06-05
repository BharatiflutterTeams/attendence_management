import {jwtDecode} from 'jwt-decode';
//import { useAuthStore } from '../appStore';

const useAuth = async()=>{
    
    //let  token = useAuthStore((state) => state.token);
     const token = localStorage.getItem('jwtToken')
    let isAdmin = false;
    let isSuperAdmin = false;
    let username ='';
    let status = '';
    let roles = '';

    if(token){
        const decode =  jwtDecode(token);
         roles = [decode.role];
         username = decode.name;
         isAdmin = roles.includes('admin');
         isSuperAdmin = roles.includes('superadmin');

         if(isAdmin){status = "Admin"}

         if(isSuperAdmin){status ="superAdmin"}

         return {username , roles,isAdmin,isSuperAdmin,status}
    }

    return {roles:'', isAdmin,isSuperAdmin,status}
}


export default useAuth;