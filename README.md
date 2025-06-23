# CartCheck 🛒

A feature-rich collaborative shopping list application built with Next.js, React, and Prisma.

## Features

### 🏘️ Group Management
- Create and join shopping groups
- Invite members with unique invite codes
- Role-based permissions (Creator, Admin, Member)
- Smart ownership transfer when creators leave

### 📝 Shopping Lists
- Create shopping lists within groups
- Real-time progress tracking
- Mark lists as completed/active
- Collaborative list management

### 🛍️ Shopping Items
- Add items with detailed information
- Quantity, units, and notes support
- Priority levels (Low, Medium, High, Urgent)
- Category organization
- Price tracking (estimated vs actual)
- Check off items as completed

### 👥 Collaboration
- Share lists with group members
- Real-time updates across users
- Group-based access control
- Member management

### 🎨 User Experience
- Modern, responsive design
- Mobile-first approach
- Intuitive navigation
- Toast notifications
- Loading states and empty states
- Progress visualization

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL with Prisma ORM
- **UI Components**: Lucide React Icons
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ChanceW/CartCheck.git
cd CartCheck
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Fill in your environment variables:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/cartcheck"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# OAuth providers (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

4. Set up the database:
```bash
npx prisma migrate dev
npx prisma generate
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Schema

The application uses the following main models:

- **User**: User accounts and authentication
- **Group**: Shopping groups that users can join
- **GroupMember**: Junction table for group membership with roles
- **ShoppingList**: Shopping lists belonging to groups
- **ShoppingItem**: Individual items in shopping lists

## API Routes

### Authentication
- `POST /api/auth/register` - User registration
- `GET/POST /api/auth/[...nextauth]` - NextAuth.js authentication

### Groups
- `GET /api/groups` - Get user's groups
- `POST /api/groups` - Create new group
- `POST /api/groups/join` - Join group with invite code
- `DELETE /api/groups/[groupId]/leave` - Leave group

### Shopping Lists
- `GET /api/groups/[groupId]/shopping-lists` - Get group's shopping lists
- `POST /api/groups/[groupId]/shopping-lists` - Create new shopping list
- `GET /api/shopping-lists/[listId]` - Get shopping list details
- `PUT /api/shopping-lists/[listId]` - Update shopping list
- `DELETE /api/shopping-lists/[listId]` - Delete shopping list
- `GET /api/shopping-lists/recent` - Get recent shopping lists

### Shopping Items
- `GET /api/shopping-lists/[listId]/items` - Get list items
- `POST /api/shopping-lists/[listId]/items` - Add new item
- `PUT /api/shopping-items/[itemId]` - Update item
- `DELETE /api/shopping-items/[itemId]` - Delete item

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard page
│   ├── groups/            # Group management pages
│   ├── shopping-lists/    # Shopping list pages
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── Logo.tsx          # Application logo
│   └── providers/        # Context providers
├── lib/                  # Utility libraries
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # Utility functions
├── types/                # TypeScript type definitions
└── prisma/               # Database schema and migrations
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you have any questions or need help, please open an issue in the GitHub repository.

---

Built with ❤️ using Next.js and modern web technologies. 