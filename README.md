# **Backend 101 Final Project**

Create a web app that will allow users to login and register, post, update, and delete their listings, view other listings, and submit reviews.

# **Functionalities**

-   users can register and sign in
-   users can post their own listings
-   users can modify or delete their own listings
-   userse can view and submit reviews to other listings

# **How To Run**

1.  Install dependencies (`npm install`)
2.  Load in data (`node seed.js`)
    -   You can optionally change what database to be used on mongodb by configuring the DB_URL in the `.env` file. By default, the application will use the `booking` database (eg.  mongodb://localhost:27017/**booking**)
3.  Start Server (`nodemon`, `npm run start`, `node index.js`)

# **User Credentials**

1. ```
    EMAIL: testmail@mail.com
    PASSWORD: test123
   ```
2. ```
    EMAIL: user01@mail.com
    PASSWORD: user1pass
   ```
3. ```
    EMAIL: user_2@mail.com
    PASSWORD: user2pass
   ```
