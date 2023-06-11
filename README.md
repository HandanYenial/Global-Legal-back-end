
# Global & Legal (back-end)
<p align = "center">
<img src = "https://azbigmedia.com/wp-content/uploads/2021/01/legal-industry-trends-technology.jpg" width="550" height="350"/>
</p>

Welcome to Global&Legal app specifically designed to streamline case management for law firms. With Global&Legal, the process of assigning and tracking cases becomes effortless, enabling users to focus on what matters most: delivering exceptional legal services to the clients.

The website is deployed : https://globallegal22.surge.sh/

## Pages and Usage
**Homepage:** Homepage displays a login and a register buttons. Only registered users can use other links associated with the app.

**Practice:** Practice page displays all lawfirm practice areas, and a brief information about each practice area. There is a link for each practice area to display the lawsuits. 

**Profile:** Displays user information, and lets user to change user information.

**Lawsuits:** Display all lawsuits in the firm and lets user to add the lawsuits in their account.

## Tech Stack
- ***Heroku:*** A container-based cloud Platform as a Service (PaaS)it is used to deploy and manage the website.

- ***React:*** React is javaScript library that enables developers to build single page application.

- ***JavaScript:*** JavaScript is a text-based programming language that allows developers to make web pages interactive

- ***Node.js:*** Node is an open source development platform. It ised for the connection from the browser to the server.

- ***Express.js:*** Express is a node js web application. It is used for building a single page application.

- ***WTForms:*** A python library that privides web form rendering and data validation.

- ***PostgreSQL:*** Database, primary data storage.

- ***Bcrypt:*** To hash the user passwords. 

- ***CSS and mdb-react-ui-kit:*** To style the webpage

- ***Bootstrap5 and React-Bootstrap:*** To create a responsive webpage.

- ***JsonWebToken:*** JWT is an open standard which is used for sharing security information between the client and the server.

-***React Testing Library:*** Testing utility tool, which is used for testing the actual DOM tree rendered by React on the browser.

-***Jest:*** Jest is an open-source testing framework built on JavaScript.


## How is the GlobalApi used in Global&Legal?
**Lawsuit Search**
__Method:__ GET
__Summary:__ Lawsuit Search
__Description:__ Find lawsuits with the keyword(title)
__/lawsuits/title__

**Practice Area Search**
__Method: __GET
__Summary:__ Practice Area Search
__Description:__ Find practice areas with the keyword(handle)
__/categories/handle__

                     
##  Routes 
|     Routes     |  Method  |  User/Admin  |          Details             |
|----------------|----------|------------------|------------------------------|
|    /register     |Get/Post |      User/Admin        | Create and display a new user with Sign Up Form built by React Forms with username,email,password,first name and last name.|
|    /login      | Get/Post |      User/Admin       | Display the Login form built by React Forms and authenticate the user.|
|    /logout     | Get      | User/Admin     | Logout the user and clear any information in the session|
|/ users/user_id| Get     | Admin     |Show user profile : username, firstname, lastname, email|
|/users/update   |Get/Post  |User/Admin |Update profile for the user by using Profile Form built in React Forms|
|/users/delete|   Post    |Admin/User|Delete user|
|/homepage    |Get   |User/Admin     |Displays login and register links|
|/categories    |Get  |Admin/User |Displays all practice areas and seacrh for a practice area by keyword.|
|/categories/handle |Get| User/ Admin | Displays practice area description adn shows the lawsuits in that practice area.|
|/lawsuits |Get|User/Admin |Shows lawsuit list and let user to add a lawsuit to their profile, seacrh for a lawsuit|
|/lawsuits/title| Get| Admin/User |Shows more information about a lawsuit|


## Database Schema

![GlobalDatabase](https://user-images.githubusercontent.com/88174651/188004693-d007d1c3-7a8d-4834-907e-7b142c90b57e.png)




