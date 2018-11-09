// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
    production: false,
    firebase: {
        apiKey: 'AIzaSyBJGv8kHK9xsrHgdXMOrAT_LaR8oC3eg0U',
        authDomain: 'midgaard-event-booking-system.firebaseapp.com',
        databaseURL: 'https://midgaard-event-booking-system.firebaseio.com',
        projectId: 'midgaard-event-booking-system',
        storageBucket: 'midgaard-event-booking-system.appspot.com',
        messagingSenderId: '788583887049'
    }
};
