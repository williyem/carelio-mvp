import LogoSvg from '@/assets/icons/logo-svg';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import PatientLoginForm from './patient-login-form';
import NewHealthAssistantLogin from './new-health-assistant-login';

const AuthTabs = () => {
  return (
    <div className="h-full overflow-x-hidden w-full">
      <Tabs defaultValue="health-assistant" className="w-full h-full">
        <div className="flex flex-col sm:flex-row justify-between  max-lg:justify-end gap-3 sm:gap-0 px-4 sm:px-0 w-full ">
          <div className="shrink-0 hide-below-lg">
            <div className="flex justify-center sm:justify-start items-center">
              <LogoSvg className="w-[80px] h-[36px] md:w-[124px] md:h-[56px]" />
            </div>
          </div>
          {/* <TabsList className="h-[45px] md:h-[57px] p-[4px] md:p-[5px] shrink-0 w-full sm:w-auto">
            <TabsTrigger
              value="health-assistant"
              className="min-w-[100px] md:min-w-[142px] text-[12px] md:text-[14px] px-2 md:px-3"
            >
              Health Assistant
            </TabsTrigger>
            <TabsTrigger
              value="patient"
              className="min-w-[100px] md:min-w-[142px] text-[12px] md:text-[14px] px-2 md:px-3"
            >
              Patient
            </TabsTrigger>
          </TabsList> */}
        </div>

        <TabsContent value="health-assistant" className=" w-full h-full ">
          <NewHealthAssistantLogin />
        </TabsContent>
        <TabsContent value="patient" className=" w-full h-full ">
          <PatientLoginForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuthTabs;
