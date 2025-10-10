# 🧪 **Test User Dataset for Authentication**

## 📋 **Quick Reference**

Use these test credentials to verify your authentication system:

### 🔐 **Test Users Available:**

| Name | Email | Password | Description |
|------|-------|----------|-------------|
| **John Doe** | `john.doe@example.com` | `JohnDoe123!` | Standard user with mixed case |
| **Jane Smith** | `jane.smith@example.com` | `SecurePass456@` | User with special characters |
| **Test User** | `test.user@example.com` | `TestUser123!` | Generic test account |
| **Admin User** | `admin@example.com` | `AdminPass999&` | Admin account for testing |
| **Demo Account** | `demo@mytodoo.com` | `DemoAccount2024!` | Demo for presentations |

### 🎯 **How to Use:**

1. **Quick Select**: In the Auth Debug screen, tap any user chip to auto-fill credentials
2. **Manual Entry**: Copy/paste email and password from table above
3. **Test Buttons**:
   - 👤 **Create Test User**: Creates a new user via signup endpoint
   - 📊 **Test All Users**: Tests login with all users in dataset
   - 🧪 **Test Request Formats**: Tests different JSON structures
   - 🔑 **Test Credentials**: Tests with currently entered credentials

### 🔍 **Testing Strategy:**

1. **Start with "Create Test User"** - This creates a known user in your database
2. **If that works**, try "Test All Users" to see if any existing users work
3. **If issues persist**, use "Test Request Formats" to debug JSON structure
4. **Use "Test Credentials"** for specific email/password combinations

### 🚨 **Important Notes:**

- **Passwords include special characters** (!, @, #, &, $) for security testing
- **All emails use common domains** (@example.com, @test.com, @mytodoo.com)
- **Mix of uppercase/lowercase** in passwords for complexity testing
- **All passwords are 8+ characters** meeting common security requirements

### 🔄 **Expected Backend Response:**

**Success (200):**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "First",
    "lastName": "Last"
  }
}
```

**Error (400/401):**
```json
{
  "message": "Invalid credentials"
}
```

### 📝 **Current Debug Results:**

Based on your recent tests, your backend expects:
- ✅ **Format**: `{email, password}` (Format 1 is correct)
- ❌ **Issue**: User credentials not found in database
- 🎯 **Solution**: Create users first with signup endpoint

---

*This dataset is automatically loaded in your Auth Debug screen for easy testing!* 🚀