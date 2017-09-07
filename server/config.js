import { ServiceConfiguration } from 'meteor/service-configuration';

ServiceConfiguration.configurations.remove(
  { service: 'google' },
);
ServiceConfiguration.configurations.upsert(
  { service: 'google' },
  {
    $set: {
      loginStyle: 'popup',
      clientId: '1064597393867-gsget54tkjjf4f524r2d8d9tqlkclnv3.apps.googleusercontent.com', // See table below for correct property name!
      secret: 'b8Wf-2c-m-Q8JL73iDXb-TbG',
    },
  },
);
