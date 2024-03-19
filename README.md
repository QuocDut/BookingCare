# shared-doctor-care
## Quickstart (after downloading this project)
1. Open this project with your favorite editor(IDE), eg: Visual Studio Code
2. Run the command (to install the node_modules): npm install
3. Copy the .env.example, create a new file, name ".env"  in root folder (the same level with .env.example)
4. Create the database: open Mysql Workbench or PHP myadmin or any database management system, run the "database.sql" in the "database" folder.
It will automatically create a new schema, name "doctorcare" in your database.
5. Update the .env file
- If you use "no-password" to login to your database, this variable "DB_PASSWORD" will be blank, otherwise, provide your password.
Default, I use the root account. If you use other accounts, change the "DB_USERNAME" variable.
- With the variable "MAIL_USERNAME", is your email 
"MAIL_PASSWORD" is your email app password (not your email's password). you need to generate one here: https://myaccount.google.com/apppasswords
( Select App: Mail, Select Device: Windows Computer -> Generate )
6. To run this app, use the command: npm start
7. Enjoy!

Note: I'll update a video to guide you to set up this project soon. Thank you for helping me. Have a nice day! - HaryPhamDev
