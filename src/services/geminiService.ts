/**
 * AI-powered Task Title Suggestions Service using Gemini API
 * Provides category-based title suggestions for task creation
 */

export interface TitleSuggestion {
  title: string;
  confidence: number;
}

export class GeminiService {
  private static instance: GeminiService;
  private readonly apiKey: string;
  private readonly apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  private constructor() {
    // You'll need to add your Gemini API key to environment variables
    this.apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️ Gemini API key not found in environment variables');
    }
  }

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  /**
   * Get AI-powered task title suggestions based on selected category
   */
  async suggestTaskTitles(category: string): Promise<string[]> {
    console.log('🤖 Getting AI title suggestions for category:', category);
    
    try {
      // First try offline suggestions for better performance
      const offlineSuggestions = this.getOfflineSuggestions(category);
      if (offlineSuggestions.length > 0) {
        console.log('📱 Using offline suggestions for:', category);
        return offlineSuggestions;
      }

      // If no offline suggestions found, try generic suggestions first
      console.log('📋 No offline suggestions found, using generic suggestions for:', category);
      return this.getGenericSuggestions();
      
    } catch (error) {
      console.error('❌ Error getting title suggestions:', error);
      // Always return generic suggestions as final fallback
      return this.getGenericSuggestions();
    }
  }

  /**
   * Get category-specific suggestions without AI (offline)
   * Based on your web implementation's categoryMap
   */
  private getOfflineSuggestions(category: string): string[] {
    const categoryMap: Record<string, string[]> = {
      // Home & Maintenance
      "Plumbing": [
        "Fix leaking tap",
        "Unclog bathroom drain", 
        "Install new sink",
        "Repair toilet flush",
        "Replace shower head"
      ],
      "Electrical": [
        "Install ceiling fan",
        "Fix power outlet",
        "Replace light switch", 
        "Install outdoor lights",
        "Repair faulty wiring"
      ],
      "Building Maintenance and Renovations": [
        "Reliable service required",
        "Get professional assistance",
        "Complete project quickly", 
        "Expert help needed",
        "Bathroom renovation project",
        "Kitchen makeover planning",
        "Interior painting service",
        "Roof repair and maintenance",
        "Building inspection service",
        "House renovation consultation",
        "Commercial building maintenance",
        "Property renovation management"
      ],
      "Buliding Maintatance and Renovations": [
        "Reliable service required",
        "Get professional assistance",
        "Complete project quickly", 
        "Expert help needed",
        "Bathroom renovation project"
      ],
      "Building Maintenance": [
        "Reliable service required",
        "Building inspection service",
        "Preventive maintenance check", 
        "Commercial building maintenance",
        "Property maintenance service",
        "Facility management support"
      ],
      "Renovations": [
        "Complete house renovation", 
        "Bathroom renovation project",
        "Kitchen renovation planning",
        "Office space renovation",
        "Property renovation consultation"
      ],
      "Carpentry": [
        "Custom furniture building",
        "Repair wooden furniture",
        "Install kitchen cabinets",
        "Build outdoor deck",
        "Fix squeaky floorboards"
      ],
      "Painting": [
        "Interior house painting",
        "Exterior wall painting", 
        "Room color makeover",
        "Professional painting service",
        "Touch-up paint work"
      ],
      "Cleaning and Organising": [
        "Deep house cleaning",
        "Office space cleaning",
        "Move-in cleaning service",
        "Regular home maintenance",
        "Spring cleaning help"
      ],
      "Gardening and Landscaping": [
        "Lawn mowing service",
        "Garden design consultation",
        "Tree pruning required",
        "Landscape maintenance",
        "Plant installation help"
      ],
      // Technology & Digital
      "IT & Tech": [
        "Computer repair needed",
        "Software installation help",
        "Network setup required",
        "Data recovery service",
        "Tech support needed"
      ],
      "Web & App Development": [
        "Website development project",
        "Mobile app creation",
        "E-commerce site build",
        "Custom software solution",
        "Digital platform development"
      ],
      "Graphic Design": [
        "Logo design needed",
        "Branding package creation",
        "Marketing material design",
        "Website graphics required",
        "Print design service"
      ],
      // Business & Professional
      "Business and Accounting": [
        "Bookkeeping services needed",
        "Tax preparation help",
        "Business plan development",
        "Financial consultation required",
        "Accounting system setup"
      ],
      "Legal Services": [
        "Legal document review",
        "Contract drafting service",
        "Legal advice needed",
        "Document preparation help",
        "Legal consultation required"
      ],
      "Marketing and Advertising": [
        "Social media campaign",
        "Content marketing strategy",
        "Advertisement design",
        "Brand promotion help",
        "Marketing consultation needed"
      ],
      // Personal & Lifestyle
      "Education and Tutoring": [
        "Math tutoring needed",
        "Language lessons required",
        "Exam preparation help",
        "Skill development coaching",
        "Academic support needed"
      ],
      "Health & Fitness": [
        "Personal training session",
        "Fitness coaching needed",
        "Nutrition consultation",
        "Workout plan creation",
        "Health assessment required"
      ],
      "Pet Care": [
        "Dog walking service",
        "Pet sitting needed",
        "Grooming appointment required",
        "Veterinary consultation",
        "Pet training help"
      ],
      "Personal Assistance": [
        "Administrative support needed",
        "Personal organization help",
        "Appointment scheduling service",
        "Research assistance required",
        "Personal shopping help"
      ],
      // Creative & Entertainment  
      "Cooking Classes": [
        "Beginner cooking lessons",
        "Advanced culinary techniques", 
        "Baking workshop needed",
        "International cuisine classes",
        "Private cooking instruction"
      ],
      "Testing 123": [
        "Test task creation",
        "Sample project setup",
        "Demo service request",
        "Trial run needed",
        "Testing functionality"
      ],
      "Photography": [
        "Event photography needed",
        "Portrait session required",
        "Product photography service",
        "Photo editing help",
        "Professional headshots"
      ],
      "Music and Entertainment": [
        "Live music performance",
        "DJ services needed",
        "Entertainment planning",
        "Music lessons required",
        "Audio production help"
      ],
      "Event Planning": [
        "Wedding planning service",
        "Birthday party organization",
        "Corporate event coordination",
        "Party planning help",
        "Event management needed"
      ],
      // Transport & Delivery
      "Removalist": [
        "House moving service",
        "Furniture delivery help",
        "Office relocation needed",
        "Heavy item moving",
        "Packing and moving service"
      ],
      "Delivery": [
        "Same-day delivery needed",
        "Package pickup service",
        "Local delivery help",
        "Courier service required",
        "Express delivery needed"
      ],
      // Automotive
      "Auto Mechanic and Electrician": [
        "Car repair service needed",
        "Vehicle maintenance required",
        "Auto electrical work",
        "Engine diagnostic service",
        "Brake system repair"
      ],
      "Auto Michanic and Electrician": [
        "Car repair service needed",
        "Vehicle maintenance required",
        "Auto electrical work"
      ],
      "Automotive": [
        "Vehicle inspection needed",
        "Car maintenance service",
        "Auto repair consultation",
        "Vehicle troubleshooting",
        "Automotive service required"
      ],
      // Furniture & Assembly
      "Furniture Repair and Flatpack Assembly": [
        "IKEA furniture assembly",
        "Furniture repair service",
        "Flatpack assembly help",
        "Wardrobe installation",
        "Desk setup required"
      ],
      "Furniture repair and Flatpack Assemply": [
        "IKEA furniture assembly",
        "Furniture repair service", 
        "Flatpack assembly help",
        "Wardrobe installation",
        "Desk setup required"
      ],
      "Handyman and Handywomen": [
        "General repair work",
        "Home maintenance service",
        "Fix-it consultation",
        "Handyman service needed",
        "Repair and installation help"
      ],
      // Appliances
      "Appliance installation and repair": [
        "Washing machine repair",
        "Refrigerator installation",
        "Dishwasher setup needed",
        "Appliance troubleshooting",
        "Kitchen appliance repair"
      ],
      // General/Default
      "Something Else": [
        "Custom service needed",
        "Specialized help required",
        "Unique project assistance",
        "Professional consultation",
        "Expert guidance needed"
      ]
    };
    
    // Get suggestions for the exact category match
    const suggestions = categoryMap[category];
    if (suggestions && suggestions.length > 0) {
      return suggestions.slice(0, 5); // Return top 5 suggestions
    }
    
    // Try partial matches for similar categories
    const categoryLower = category.toLowerCase();
    for (const [key, values] of Object.entries(categoryMap)) {
      if (key.toLowerCase().includes(categoryLower) || categoryLower.includes(key.toLowerCase())) {
        return values.slice(0, 5);
      }
    }
    
    return [];
  }

  /**
   * Get AI-generated suggestions using Gemini API (optional fallback)
   */
  private async getAISuggestions(category: string): Promise<string[]> {
    if (!this.apiKey) {
      console.log('❌ No API key available, falling back to generic suggestions');
      return this.getGenericSuggestions();
    }

    console.log('🤖 Calling Gemini API for category:', category);

    const prompt = `Generate 5 concise task titles for "${category}" category. 
    Focus on common service requests. 
    Each title should be 3-7 words, actionable, and professional.
    Return only the titles, one per line, without numbers or bullets.`;

    try {
      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      console.log('📡 API Response status:', response.status);

      if (!response.ok) {
        console.log('📡 API Error: Status', response.status);
        // Don't throw error, just fallback to generic suggestions
        return this.getGenericSuggestions();
      }

      const data = await response.json();
      console.log('📡 API Response received successfully');
      
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (text) {
        const suggestions = text
          .split('\n')
          .map((line: string) => line.trim())
          .filter((line: string) => line.length > 0 && line.length < 100)
          .slice(0, 5);
        
        console.log('🤖 AI generated suggestions:', suggestions);
        return suggestions.length > 0 ? suggestions : this.getGenericSuggestions();
      }

      console.log('❌ Invalid response format from Gemini API, using generic suggestions');
      return this.getGenericSuggestions();

    } catch (error) {
      console.log('❌ AI API call failed, using generic suggestions:', error);
      // Always fallback to generic suggestions instead of throwing
      return this.getGenericSuggestions();
    }
  }

  /**
   * Fallback generic suggestions when category-specific ones aren't available
   */
  private getGenericSuggestions(): string[] {
    return [
      "Help with specific task",
      "Get professional assistance", 
      "Complete project quickly",
      "Expert help needed",
      "Reliable service required"
    ];
  }

  /**
   * Check if a category has offline suggestions available
   */
  hasOfflineSuggestions(category: string): boolean {
    const offlineSuggestions = this.getOfflineSuggestions(category);
    return offlineSuggestions.length > 0;
  }
}

// Export singleton instance
export const geminiService = GeminiService.getInstance();