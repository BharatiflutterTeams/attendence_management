import create from 'zustand';
import {persist} from 'zustand/middleware';

let appStore = (set) =>({
    dopen : true,
    updateOpen:(dopen) => set((state)=>({dopen:dopen}))
});

//  export const useAuthStore = (set) => ({
//     token: "",
//     setToken: (token) => set({ token: String(token) }),
//     clearToken: () => set({ token: "" }),
//   });

appStore = persist(appStore,{name:"my_app_store"});
export const useAppStore = create(appStore);