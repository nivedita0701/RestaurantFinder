# Restaurant Finder - Comprehensive Dashboard

Welcome to **Restaurant Finder**! This application provides a robust platform for **Admins**, **Business Owners**, and **Customers** to interact dynamically with restaurant data, manage operations, and enjoy a seamless experience. From managing restaurant listings to dynamic gallery management and Google Maps integration, the platform offers a wide range of features for every role.

![Landing_Page](https://github.com/user-attachments/assets/f1f2c853-6e11-4b4c-a38e-23bf6db589cd)

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [State Management](#state-management)
- [API Endpoints](#api-endpoints)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### For Admins:
- **Review Pending Listings**: Approve or reject restaurant listings awaiting verification.
- **Handle Deletion Requests**: Approve and permanently delete restaurants along with associated data.
- **User Management**: Manage user roles and monitor platform activities.
- **Review Management**: Moderate customer reviews for quality and compliance.

### For Business Owners:
- **Register Restaurants**: Add restaurants with details such as name, category, location, working hours, menu, and images.
- **Update Listings**: Modify restaurant details dynamically, including working hours and gallery images.
- **Day-Wise Hours**: Set unique working hours for specific days or apply universal hours.
- **Closed Days**: Specify non-operational days.
- **Menu Management**: Create and edit menus with pricing.
- **Track Status**: Monitor approval status of restaurant listings.
- **Request Deletions**: Submit deletion requests for restaurants.

### For Customers:
- **Search Restaurants**: Filter by name, category, price range, rating, and location.
- **Interactive Maps**: View restaurant locations and search within specific areas using Google Maps.
- **Dynamic Search and Filters**: Real-time search and filter updates without refreshing the page.
- **View Details**: Access detailed restaurant information, including menus, working hours, and gallery images.
- **Submit Reviews**: Leave reviews with ratings to help others make informed decisions.

### General Features:
- **Geolocation**: Enable users to find restaurants near their location.
- **Secure Authentication**: Role-based access control ensures data integrity.
- **Google Maps Integration**: Dynamically display restaurant locations and allow location-based searches.
- **Dynamic Image Gallery**: Upload, update, and delete images for restaurant listings.
- **Responsive Design**: Fully responsive UI for a seamless experience across devices.
- **Secure Authentication**: Role-based access control for admins, business owners, and customers.
- **Real-Time Updates**: Instantly reflect changes to listings, menus, and reviews.
- **AWS Deployment**: The application is hosted on AWS with load balancing for high availability and performance.
---

## Technologies Used

### Frontend:
- **React**: UI development with functional components.
- **Material-UI**: Pre-built components for a modern, responsive design.
- **Google Maps API**: Geolocation and map integration for restaurant selection and display.

### Backend:
- **Node.js & Express**: REST API development.
- **PostgreSQL**: Relational database for storing restaurant and user data.
- **Sequelize**: ORM for database management.
- **Nodemailer**: Email notifications for password resets and status updates.

### DevOps:
- **Docker**: Containerized deployment.
- **AWS S3**: Storage for image uploads.
- **AWS Load Balancer**: Ensures high availability and fault tolerance for the application.

---

## Installation

### Prerequisites:
- Node.js v16+
- PostgreSQL
- Google Maps API Key
- AWS S3 Credentials (for image uploads)

### Setup:

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/restaurant-finder.git
   cd restaurant-finder
   ```

2. Install dependencies:
   ```bash
   npm install
   cd client && npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:
   ```env
   PORT=5001
   DATABASE_URL=your_database_url
   EMAIL_USER=your_email
   EMAIL_PASS=your_email_password
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   AWS_ACCESS_KEY_ID=your_aws_access_key_id
   AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
   AWS_BUCKET_NAME=your_s3_bucket_name
   ```

4. Run database migrations:
   ```bash
   npm run db:migrate
   ```

5. Start the development servers:
   - Backend:
     ```bash
     npm start
     ```
   - Frontend:
     ```bash
     cd client
     npm start
     ```

---

## Usage

### Admins:
1. Log in to the admin dashboard.
2. Review and approve pending restaurant listings.
3. Manage user accounts and permissions.
4. Approve or reject restaurant deletion requests.
5. Monitor customer reviews and take necessary actions.

### Business Owners:
1. Sign up or log in.
2. Register your restaurant using the "Register New Business" button.
3. Add details like working hours, menu, gallery images, and map location.
4. Manage your listings and track their approval status.
5. Request deletion of a restaurant listing if needed.

### Customers:
1. Search for restaurants using filters like category, price range, and ratings.
2. View restaurant details, including menus and images.
3. Leave reviews and ratings for restaurants you visit.

---

## State Management

This application uses React's **useState** and **useEffect** hooks to manage local state for:
- User input in forms (e.g., restaurant registration, filters).
- Dynamic data (e.g., restaurants, categories, reviews).

State for more complex features is organized using component-specific state logic. For larger-scale state requirements, integrating a global state management tool like Redux or Context API can be considered for scalability.

---

## API Endpoints

### Authentication:
- **POST** `/api/users/register`: Register a new user.
- **POST** `/api/users/login`: Log in.
- **POST** `/api/users/forgot-password`: Request a password reset link.
- **POST** `/api/users/reset-password/:token`: Reset password using a token.

### Restaurants:
- **GET** `/api/restaurants`: Fetch all approved restaurants.
- **POST** `/api/restaurants`: Register a new restaurant (Business Owner).
- **PUT** `/api/restaurants/:id`: Update restaurant details (Business Owner).
- **GET** `/api/restaurants/owner`: Fetch restaurants owned by the logged-in user.
- **PUT** `/api/restaurants/:id/request-delete`: Request deletion of a restaurant (Business Owner).
- **GET** `/api/restaurants/categories` - Fetch all restaurant categories.
- **GET** `/api/admin/pending-restaurants`: Fetch all pending restaurants (Admin).
- **PUT** `/api/admin/approve-restaurant/:id`: Approve a restaurant listing (Admin).
- **PUT** `/api/admin/reject-restaurant/:id`: Reject a restaurant listing (Admin).
- **DELETE** `/api/admin/approve-delete/:id`: Permanently delete a restaurant and associated data (Admin).

### Reviews:
- **POST** `/api/reviews`: Submit a review for a restaurant.
- **GET** `/api/reviews/:restaurantId`: Fetch reviews for a specific restaurant.

---

## Future Enhancements

- Add support for more advanced search filters.
- Implement user profile pages.
- Enable support for social media logins (Google, Facebook).
- Add analytics for business owners to track customer engagement.
- Integrate AI-based recommendations for customers.

---

## Contributing

We welcome contributions to improve this project! To contribute:
1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add your message here"
   ```
4. Push to your branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a pull request.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

### Happy Coding! 🚀
