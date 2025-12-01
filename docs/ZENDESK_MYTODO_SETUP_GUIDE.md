# 🚀 Complete Zendesk Setup Guide for MyToDoo App

## Overview
This guide will walk you through setting up your Zendesk Help Center so it works perfectly with your MyToDoo mobile app. Follow each step carefully.

---

## 📋 What You'll Accomplish

By the end of this guide, your app will:
- ✅ Show Help Center instead of login page
- ✅ Display organized Q&A for Customers and Taskers
- ✅ Have searchable help articles
- ✅ Match MyToDoo branding

**Time needed**: 30-45 minutes

---

## 🎯 PART 1: Activate & Configure Zendesk

### Step 1.1: Access Zendesk Admin

1. Open your browser
2. Go to: **https://mytodo.zendesk.com/admin**
3. Log in with your Zendesk credentials

### Step 1.2: Activate Guide (Help Center)

**Navigation Path:**
```
Admin Center → Products → Guide → Get started
```

**Detailed Steps:**

1. In the left sidebar, look for **"Products"** or scroll down to find **"Guide"**
2. If you see **"Guide"** in the sidebar:
   - Click on it
   - Look for **"Activate"** or **"Get started"** button
3. If you DON'T see "Guide":
   - Look for **"Add product"** or similar
   - Select **"Guide"** from the list
4. Click **"Activate Guide"** or **"Get started"**
5. Choose theme: **Copenhagen** (recommended)
6. Click **"Publish"** or **"Activate"**

**Result:** Guide should now appear in your left sidebar

---

### Step 1.3: Make Help Center Public (CRITICAL!)

**This is why you see the login page!**

**Navigation Path:**
```
Admin Center → Guide → Settings → Security
```

**Detailed Steps:**

1. In the left sidebar, click **"Guide"**
2. Click **"Settings"**
3. Look for **"Help Center access"** or **"Security"** section
4. You'll see two radio button options:
   ```
   ○ Require sign-in to view articles
   ● Anyone can view articles  ← SELECT THIS ONE!
   ```
5. Select: **"Anyone can view articles"**
6. Scroll down and click **"Save"**

**Test immediately:**
- Open new tab: **https://mytodo.zendesk.com/hc/en-us**
- You should now see Help Center (not login page!)

---

## 🎯 PART 2: Create Help Center Structure

### Step 2.1: Access Guide Admin

**Direct URL:** https://mytodo.zendesk.com/hc/admin

**Or navigate:**
```
Admin Center → Guide → Guide admin
```

You should now see the Help Center management interface.

---

### Step 2.2: Create Categories

Click **"Arrange content"** → **"+ Add category"**

#### Category 1: For Customers

**Details to enter:**
```
Name: I am a Customer
Description: Help for people posting tasks and hiring taskers
```

**Settings:**
- Position: 1
- Visible: Yes
- Status: Published

Click **"Save"**

#### Category 2: For Taskers

**Details to enter:**
```
Name: I am a Tasker
Description: Help for people completing tasks and earning money
```

**Settings:**
- Position: 2
- Visible: Yes
- Status: Published

Click **"Save"**

#### Category 3: Account & Safety

**Details to enter:**
```
Name: Account & Safety
Description: Account settings, security, and community guidelines
```

**Settings:**
- Position: 3
- Visible: Yes
- Status: Published

Click **"Save"**

---

### Step 2.3: Create Sections Within Categories

#### In "I am a Customer" Category:

Click on **"I am a Customer"** → **"+ Add section"**

**Section 1:**
```
Name: Getting Started
Description: New to MyToDoo? Start here
Position: 1
```

**Section 2:**
```
Name: Posting Tasks
Description: How to create and manage tasks
Position: 2
```

**Section 3:**
```
Name: Payments
Description: Payment methods and billing
Position: 3
```

#### In "I am a Tasker" Category:

**Section 1:**
```
Name: Getting Started
Description: Begin your tasking journey
Position: 1
```

**Section 2:**
```
Name: Making Offers
Description: How to bid on and accept tasks
Position: 2
```

**Section 3:**
```
Name: Earnings & Payouts
Description: Getting paid and managing your earnings
Position: 3
```

#### In "Account & Safety" Category:

**Section 1:**
```
Name: Account Management
Description: Login, profile, and settings
Position: 1
```

**Section 2:**
```
Name: Safety & Guidelines
Description: Community rules and safety tips
Position: 2
```

---

## 🎯 PART 3: Write Help Articles

Now the important part - adding the Q&A content!

### Template for Each Article

```markdown
Title: [Question]

Body:
[Brief answer paragraph]

## How to [Action]

1. Step one
2. Step two
3. Step three

[Additional helpful information]

## Related Articles
- [Link to related article]

## Still need help?
Contact our support team at support@mytodo.com
```

---

### Articles for "I am a Customer" → "Getting Started"

#### Article 1: How do I get started on MyToDoo?

**Navigation:** Guide admin → I am a Customer → Getting Started → + Add article

**Title:**
```
How do I get started on MyToDoo?
```

**Body:**
```markdown
Welcome to MyToDoo! Getting started is easy and takes just a few minutes.

## Creating Your Account

1. Download the MyToDoo app from the App Store or Google Play
2. Tap "Sign up" on the welcome screen
3. Enter your email address and create a secure password
4. Verify your email by clicking the link we send you
5. Complete your profile with your name and location

## Posting Your First Task

1. Tap the "Get Done" button at the bottom of the screen
2. Describe what you need help with
3. Set your budget and preferred location
4. Add photos if helpful (recommended)
5. Review and post your task

## What Happens Next

- Taskers will start making offers on your task
- You'll receive notifications for each offer
- Review tasker profiles, ratings, and prices
- Accept the offer that works best for you
- Pay securely through the app
- The tasker completes your task
- Leave a review to help others

## Tips for Success

✓ Write clear, detailed task descriptions
✓ Add photos to show exactly what you need
✓ Set a fair budget based on the work required
✓ Check tasker ratings and reviews before accepting
✓ Communicate clearly with your tasker

## Related Articles
- How do I post a task?
- How do I choose a tasker?
- Payment methods and billing

## Still Need Help?
Contact our support team at support@mytodo.com or through the app's Contact Us feature.
```

**Settings:**
- Status: **Published**
- Section: Getting Started
- Promoted: Yes (this makes it featured)

Click **"Publish"**

---

#### Article 2: How do I post a task?

**Title:**
```
How do I post a task?
```

**Body:**
```markdown
Posting a task on MyToDoo is quick and easy. Follow these steps to get help with what you need.

## Step-by-Step Guide

### 1. Start a New Task
- Open the MyToDoo app
- Tap the "Get Done" button at the bottom of the screen

### 2. Describe Your Task
- Write a clear, descriptive title
- Add detailed information about what you need
- Be specific about requirements and expectations

Example:
❌ "Need help moving"
✅ "Need help moving a 2-bedroom apartment, including furniture disassembly and reassembly, approximately 20km distance"

### 3. Set Your Budget
- Enter your budget for the task
- Consider the complexity and time required
- Look at similar tasks for price guidance
- Remember: Quality work deserves fair pay

### 4. Choose Location
- Select where the task will take place
- For online tasks, select "Online" or "Remote"
- Add specific location details if needed

### 5. Add Photos (Optional but Recommended)
- Photos help taskers understand the job
- Show the space, items, or work area
- Multiple angles are helpful
- Max 5 photos per task

### 6. Select Category
- Choose the category that best fits your task
- This helps the right taskers find your job

### 7. Set Timeline
- When do you need it done?
- Be realistic with your timeframe
- Urgent tasks may require higher budgets

### 8. Review and Post
- Double-check all details
- Make sure contact preferences are set
- Tap "Post Task"
- Your task is now live!

## What Happens After Posting

1. Taskers receive notifications about your task
2. You start receiving offers within minutes
3. Review each offer carefully
4. Accept the best offer for your needs
5. Payment is held securely until completion

## Tips for Getting Great Offers

✓ Be detailed and specific in descriptions
✓ Upload clear photos
✓ Set a fair budget
✓ Be responsive to questions from taskers
✓ Provide all necessary information upfront

## Common Mistakes to Avoid

✗ Vague descriptions
✗ Unrealistic budgets
✗ Missing important details
✗ Not responding to tasker questions

## Editing Your Task

You can edit your task before accepting an offer:
1. Go to "My Tasks"
2. Tap on your task
3. Tap the edit icon
4. Make your changes
5. Save

## Related Articles
- How to choose a tasker
- Setting the right price for your task
- What makes a good task description
- Payment and billing information

## Need Help?
Contact support at support@mytodo.com
```

Click **"Publish"**

---

#### Article 3: How do I choose the right tasker?

**Title:**
```
How do I choose the right tasker?
```

**Body:**
```markdown
Choosing the right tasker is important for getting quality work. Here's how to make the best decision.

## Review Offers Carefully

When you receive offers, check these details:

### 1. Tasker Profile
- Read their bio and experience
- Check skills and qualifications
- Look at profile completeness
- Verify ID verification badge

### 2. Ratings and Reviews
- Overall rating (aim for 4.5+ stars)
- Number of completed tasks
- Read recent reviews
- Look for relevant experience

### 3. Offer Details
- Price quoted
- Estimated time to complete
- Personal message from tasker
- Questions they ask (shows they read your task)

### 4. Response Time
- How quickly do they respond?
- Are they communicative?
- Do they ask clarifying questions?

## Red Flags to Watch For

🚩 No reviews or very few completed tasks
🚩 Significantly lower price than others (may indicate inexperience)
🚩 Copy-paste messages with no personalization
🚩 No profile picture or incomplete profile
🚩 Poor communication or slow responses

## Green Flags (Good Signs)

✅ Verified ID badge
✅ Multiple 5-star reviews
✅ Relevant experience mentioned
✅ Personalized offer message
✅ Asks clarifying questions
✅ Professional communication
✅ Reasonable price with explanation

## Making Your Decision

1. **Compare at least 3-5 offers** before deciding
2. **Don't just choose the cheapest** - consider value
3. **Read the tasker's message** - are they paying attention?
4. **Check their availability** - can they do it when you need?
5. **Ask questions** if you're unsure about anything

## Questions to Ask Taskers

- Have you done this type of work before?
- Do you have the necessary tools/equipment?
- What's included in your quoted price?
- How long will it take?
- Do you have insurance? (for certain tasks)
- Can you provide references?

## After Choosing

1. Accept the offer in the app
2. Complete payment (held securely)
3. Confirm task details and timing
4. Exchange contact information if needed
5. Set clear expectations

## If You're Not Sure

- Ask for more information
- Request photos of previous work
- Check if they have specific certifications
- Contact support for advice: support@mytodo.com

## Trust Your Instincts

If something feels off, it's okay to:
- Ask more questions
- Wait for other offers
- Choose a different tasker
- Cancel and repost with clearer requirements

## Related Articles
- Understanding tasker ratings
- How to communicate with taskers
- Payment protection and guarantees
- What to do if something goes wrong

## Need Help Choosing?
Contact our support team at support@mytodo.com
```

Click **"Publish"**

---

### Articles for "I am a Tasker" → "Earnings & Payouts"

#### Article: How do I set up my payout account?

**Title:**
```
How do I set up my payout account?
```

**Body:**
```markdown
To receive payments as a Tasker on MyToDoo, you need to set up your payout account. This is a one-time setup that takes just a few minutes.

## Why You Need This

- Receive payments from completed tasks
- Get paid directly to your bank account
- Track your earnings
- Required before accepting tasks

## Step-by-Step Setup

### 1. Open Payment Options
1. Open the MyToDoo app
2. Tap "Account" (your profile icon) at the bottom right
3. Tap "Account settings"
4. Scroll to "PAYMENTS" section
5. Tap "Payment options"

### 2. Setup Payout Account
1. Tap "Setup Payout Account" (first option at the top)
2. You'll be taken to the payout setup screen

### 3. Enter Bank Details
Fill in the required information:

**Account Holder Name**
- Must match your ID exactly
- First and last name

**Bank Account Number**
- Your full account number
- Double-check for accuracy

**BSB or Routing Number**
- Your bank's BSB (Australia) or routing number
- Find this on your bank statement or app

**Bank Name**
- Select or enter your bank

**Account Type**
- Checking/Savings
- Choose the correct type

### 4. Verify Information
1. Review all details carefully
2. Make sure everything is correct
3. Incorrect details will delay payments

### 5. Save and Verify
1. Tap "Save" or "Submit"
2. You'll receive a verification email
3. Click the link in the email to verify
4. Your payout account is now active!

## Payment Timeline

After task completion:
- Customer marks task complete
- Payment released from hold
- Processed to your account
- **Funds arrive in 2-3 business days**

## Checking Your Setup

To verify your payout account:
1. Go to Profile → Account settings → Payment options
2. You should see "Setup Payout Account" with a checkmark
3. Your bank details (last 4 digits) will be shown

## Updating Bank Details

Need to change your bank account?
1. Go to Payment options
2. Tap "Setup Payout Account"
3. Update your information
4. Verify via email again

## Important Notes

⚠️ **Account must be in your name**
- Must match your ID verification
- Business accounts accepted if you're registered

⚠️ **Supported countries**
- Check if your country is supported
- Bank must be in your country of residence

⚠️ **Security**
- Your information is encrypted
- We never see your full bank details
- Processed through secure payment partners

## Common Issues

**"Bank details rejected"**
- Double-check all numbers
- Ensure name matches exactly
- Contact your bank to verify details

**"Can't verify email"**
- Check spam folder
- Try resending verification
- Use the email linked to your account

**"Bank not listed"**
- Select "Other" and enter manually
- Contact support for help

## Viewing Payment History

After setup, track your earnings:
1. Payment options → Payment history
2. See all completed payouts
3. Download statements for taxes

## Tax Information

As a tasker, you're responsible for:
- Reporting your earnings
- Paying applicable taxes
- Keeping records of income

We provide:
- Annual earning statements
- Transaction history
- Downloadable CSV files

## Related Articles
- When do I get paid?
- Understanding tasker fees
- Payment history and statements
- Tax information for taskers

## Need Help?
Contact support at support@mytodo.com
We're here Monday-Friday, 9am-5pm
```

Click **"Publish"**

---

## 🎯 PART 4: Customize Your Help Center Theme

### Step 4.1: Access Theme Customization

**Navigation:**
```
Admin Center → Guide → Customize design
```

Or direct URL: **https://mytodo.zendesk.com/theming**

### Step 4.2: Update Branding

#### Upload Logo
1. Click "Customize design"
2. Find "Logo" section
3. Click "Upload logo"
4. Upload your MyToDoo logo
5. Recommended size: 200x50px or 400x100px
6. Format: PNG with transparent background

#### Set Brand Colors

**Primary Color:** `#0052A2` (MyToDoo blue)
**Link Color:** `#0052A2`
**Button Color:** `#0052A2`
**Header Background:** White `#FFFFFF`

**How to set:**
1. Click "Edit colors"
2. Enter hex codes for each color
3. Preview changes
4. Save

#### Customize Home Page

1. Click "Edit theme" or "Home page"
2. Add welcome message:
   ```
   Welcome to MyToDoo Help Center
   Find answers to your questions about posting tasks, completing work, and using our platform.
   ```
3. Show category cards
4. Enable search prominently
5. Save changes

### Step 4.3: Publish Theme

1. Preview your changes
2. Test on mobile and desktop
3. Click "Publish" when satisfied

---

## 🎯 PART 5: Test Everything

### Test 1: Public Access
1. Open incognito/private browser
2. Go to: **https://mytodo.zendesk.com/hc/en-us**
3. **Should see:** Help Center homepage (NOT login)
4. **Should NOT see:** Sign in page

### Test 2: Search Functionality
1. Use search bar
2. Try: "how to post task"
3. Should find relevant articles

### Test 3: Article Navigation
1. Click on a category
2. Click on a section
3. Open an article
4. Verify content displays correctly

### Test 4: Mobile App Integration
1. Open MyToDoo app
2. Go to Profile → Help and Support
3. Tap "Frequently asked questions"
4. **Should see:** Your Zendesk Help Center
5. **Should NOT see:** Login page

---

## 📝 Complete Article List to Create

Here's your complete checklist. Create one article at a time:

### For Customers (Priority Order)

**Getting Started:**
- [x] How do I get started on MyToDoo?
- [ ] What is MyToDoo?
- [ ] How does MyToDoo work?

**Posting Tasks:**
- [x] How do I post a task?
- [x] How do I choose a tasker?
- [ ] How do I edit my task?
- [ ] Can I cancel a task?
- [ ] What makes a good task description?

**Payments:**
- [ ] What payment methods are accepted?
- [ ] When do I pay?
- [ ] How do I add a payment method?
- [ ] Can I get a refund?
- [ ] Payment protection explained

### For Taskers (Priority Order)

**Getting Started:**
- [ ] How to become a tasker
- [ ] Setting up your tasker profile
- [ ] How to browse tasks

**Making Offers:**
- [ ] How do I make an offer?
- [ ] Writing great offers
- [ ] How to accept a task
- [ ] Task communication tips

**Earnings & Payouts:**
- [x] How do I set up my payout account?
- [ ] When do I get paid?
- [ ] Understanding tasker fees
- [ ] Tasker tier system
- [ ] Payment history
- [ ] Tax information

**Cancellations:**
- [ ] Tasker cancellation policy
- [ ] What happens if I cancel?
- [ ] Cancellation fees explained
- [ ] How to request cancellation

### Account & Safety

**Account Management:**
- [ ] How to reset password
- [ ] Updating profile information
- [ ] Account verification
- [ ] Deleting your account

**Safety & Guidelines:**
- [ ] Community guidelines
- [ ] Safety tips for customers
- [ ] Safety tips for taskers
- [ ] How to report a problem
- [ ] Privacy and security

---

## 🎨 Writing Tips

### Article Structure
```markdown
# [Question as Title]

Brief intro paragraph answering the question.

## Section 1: Main Steps
1. First step
2. Second step
3. Third step

## Section 2: Additional Info
More details...

## Tips / Best Practices
✓ Do this
✗ Don't do that

## Related Articles
- Link 1
- Link 2

## Need Help?
Contact support@mytodo.com
```

### Best Practices

**DO:**
- ✅ Use clear, simple language
- ✅ Add step-by-step instructions
- ✅ Include screenshots when possible
- ✅ Link to related articles
- ✅ Keep paragraphs short
- ✅ Use bullet points and lists
- ✅ Add search-friendly titles

**DON'T:**
- ❌ Use jargon or technical terms
- ❌ Write long paragraphs
- ❌ Forget to proofread
- ❌ Leave articles in draft status
- ❌ Duplicate content

---

## 🔧 Troubleshooting

### Still Seeing Login Page?

**Check:**
1. Guide is activated
2. Settings → "Anyone can view articles" is selected
3. Help Center is published (not draft)
4. You're using correct URL: https://mytodo.zendesk.com/hc/en-us

### Articles Not Showing?

**Check:**
1. Article status is "Published" (not Draft)
2. Section is visible
3. Category is visible
4. Clear browser cache

### Can't Find Guide in Admin?

**Solution:**
1. Look for "Products" in admin
2. Click "Add product"
3. Select "Guide"
4. Activate it

---

## ✅ Final Checklist

Before you're done, verify:

- [ ] Guide is activated
- [ ] Help Center is public ("Anyone can view")
- [ ] 3 categories created
- [ ] At least 2 sections per category
- [ ] At least 10 essential articles published
- [ ] Logo uploaded
- [ ] Brand colors set (#0052A2)
- [ ] Theme published
- [ ] Tested: https://mytodo.zendesk.com/hc/en-us works
- [ ] Tested: App shows Help Center (not login)
- [ ] Search works
- [ ] Articles display correctly on mobile

---

## 📞 Support

If you get stuck:

**Zendesk Help:**
- Documentation: https://support.zendesk.com
- Community: https://community.zendesk.com
- Chat support: Click bubble in Zendesk

**MyToDoo App:**
- All code is ready and working
- Configuration in: `src/config/zendesk.config.ts`
- Current subdomain: `mytodo`

---

## 🎉 You're Done!

Once completed:
- Your app will show professional Help Center
- Users can self-serve with Q&A
- You can keep adding/updating articles
- Track which articles users view most
- Reduce support burden

**Estimated time to complete:** 30-45 minutes for basic setup + ongoing for more articles

**Next steps:** Keep adding articles based on common user questions!

---

**Created for:** MyToDoo Mobile App
**Zendesk URL:** https://mytodo.zendesk.com
**Help Center URL:** https://mytodo.zendesk.com/hc/en-us
