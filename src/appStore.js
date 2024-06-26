// store.js
import create from 'zustand';
import { persist } from 'zustand/middleware';

const appStore = (set) => ({
  dopen: true,
  updateOpen: (dopen) => set((state) => ({ dopen: dopen })),
});

const companyProfileStore = (set) => ({
  companyData: null,
  setCompanyData: (newData) => set({ companyData: newData }),
});

const bookingIdStore = (set)=>({
   bookingId : null,
   setBookingId:(newData) => set({bookingId:newData}),
});


const useAppStore = create(persist(
  (set) => ({
    ...appStore(set),
    ...companyProfileStore(set),
    ...bookingIdStore(set)
  }),
  { name: 'my_app_store' }
));

export default useAppStore;
