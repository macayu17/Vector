// Company name to domain mapping for accurate favicon logos
export const COMPANY_DOMAINS: Record<string, string> = {
    // FAANG & Big Tech
    "google": "google.com",
    "microsoft": "microsoft.com",
    "apple": "apple.com",
    "meta": "meta.com",
    "amazon": "amazon.com",
    "netflix": "netflix.com",
    "adobe": "adobe.com",
    "salesforce": "salesforce.com",
    "oracle": "oracle.com",
    "ibm": "ibm.com",
    "intel": "intel.com",
    "nvidia": "nvidia.com",
    "cisco": "cisco.com",
    "samsung": "samsung.com",
    "sony": "sony.com",
    "dell": "dell.com",
    "hp": "hp.com",
    "uber": "uber.com",
    "lyft": "lyft.com",
    "airbnb": "airbnb.com",
    "spotify": "spotify.com",
    "twitter/x": "x.com",
    "twitter": "x.com",
    "x": "x.com",
    "linkedin": "linkedin.com",
    "pinterest": "pinterest.com",
    "snapchat": "snapchat.com",
    "tiktok": "tiktok.com",

    // Fintech
    "stripe": "stripe.com",
    "paypal": "paypal.com",
    "square/block": "block.xyz",
    "square": "squareup.com",
    "block": "block.xyz",
    "coinbase": "coinbase.com",
    "robinhood": "robinhood.com",
    "plaid": "plaid.com",
    "revolut": "revolut.com",
    "chime": "chime.com",
    "brex": "brex.com",
    "ramp": "ramp.com",
    "wise": "wise.com",
    "affirm": "affirm.com",
    "klarna": "klarna.com",
    "mastercard": "mastercard.com",
    "visa": "visa.com",
    "american express": "americanexpress.com",
    "goldman sachs": "goldmansachs.com",
    "jpmorgan chase": "jpmorganchase.com",
    "jpmorgan": "jpmorganchase.com",

    // Enterprise & SaaS
    "slack": "slack.com",
    "zoom": "zoom.us",
    "atlassian": "atlassian.com",
    "notion": "notion.so",
    "figma": "figma.com",
    "canva": "canva.com",
    "dropbox": "dropbox.com",
    "box": "box.com",
    "docusign": "docusign.com",
    "twilio": "twilio.com",
    "hubspot": "hubspot.com",
    "zendesk": "zendesk.com",
    "workday": "workday.com",
    "servicenow": "servicenow.com",
    "snowflake": "snowflake.com",
    "datadog": "datadoghq.com",
    "splunk": "splunk.com",
    "palantir": "palantir.com",
    "shopify": "shopify.com",
    "gitlab": "gitlab.com",
    "github": "github.com",
    "vercel": "vercel.com",
    "netlify": "netlify.com",
    "heroku": "heroku.com",
    "linear": "linear.app",

    // Indian Tech / Startups
    "flipkart": "flipkart.com",
    "zomato": "zomato.com",
    "swiggy": "swiggy.com",
    "paytm": "paytm.com",
    "phonepe": "phonepe.com",
    "razorpay": "razorpay.com",
    "ola": "olacabs.com",
    "cred": "cred.club",
    "zerodha": "zerodha.com",
    "groww": "groww.in",
    "meesho": "meesho.com",
    "nykaa": "nykaa.com",
    "udaan": "udaan.com",
    "delhivery": "delhivery.com",
    "freshworks": "freshworks.com",
    "zoho": "zoho.com",
    "postman": "postman.com",
    "browserstack": "browserstack.com",
    "dream11": "dream11.com",
    "makemytrip": "makemytrip.com",
    "infosys": "infosys.com",
    "tcs": "tcs.com",
    "wipro": "wipro.com",
    "hcl": "hcltech.com",
    "reliance": "ril.com",
    "jio": "jio.com",
    "byju's": "byjus.com",
    "byjus": "byjus.com",
    "upstox": "upstox.com",
    "unacademy": "unacademy.com",
    "curefit": "cure.fit",
    "cure.fit": "cure.fit",
    "dunzo": "dunzo.com",
    "lenskart": "lenskart.com",
    "policybazaar": "policybazaar.com",
    "housing": "housing.com",
    "urban company": "urbancompany.com",
    "urbancompany": "urbancompany.com",

    // Gaming & Entertainment
    "tesla": "tesla.com",
    "spacex": "spacex.com",
    "disney": "disney.com",
    "hulu": "hulu.com",
    "hbo": "hbo.com",
    "epic games": "epicgames.com",
    "unity": "unity.com",
    "electronic arts": "ea.com",
    "ea": "ea.com",
    "ubisoft": "ubisoft.com",
    "booking.com": "booking.com",
    "booking": "booking.com",
    "expedia": "expedia.com",
    "doordash": "doordash.com",
    "instacart": "instacart.com",
    "grubhub": "grubhub.com",
    "reddit": "reddit.com",
    "discord": "discord.com",
    "twitch": "twitch.tv",
};

export const TOP_100_COMPANIES = [
    // FAANG & Big Tech
    "Google", "Microsoft", "Apple", "Meta", "Amazon", "Netflix",
    "Adobe", "Salesforce", "Oracle", "IBM", "Intel", "NVIDIA", "Cisco",
    "Samsung", "Sony", "Dell", "HP", "Uber", "Lyft", "Airbnb", "Spotify",
    "Twitter/X", "LinkedIn", "Pinterest", "Snapchat", "TikTok",

    // Fintech
    "Stripe", "PayPal", "Square/Block", "Coinbase", "Robinhood", "Plaid",
    "Revolut", "Chime", "Brex", "Ramp", "Wise", "Affirm", "Klarna",
    "Mastercard", "Visa", "American Express", "Goldman Sachs", "JPMorgan Chase",

    // Enterprise & SaaS
    "Slack", "Zoom", "Atlassian", "Notion", "Figma", "Canva", "Dropbox",
    "Box", "DocuSign", "Twilio", "HubSpot", "Zendesk", "Workday",
    "ServiceNow", "Snowflake", "Datadog", "Splunk", "Palantir",
    "Shopify", "GitLab", "GitHub", "Vercel", "Netlify", "Heroku", "Linear",

    // Indian Tech / Startups
    "Flipkart", "Zomato", "Swiggy", "Paytm", "PhonePe", "Razorpay",
    "Ola", "CRED", "Zerodha", "Groww", "Meesho", "Nykaa", "Udaan",
    "Delhivery", "Freshworks", "Zoho", "Postman", "BrowserStack",
    "Dream11", "MakeMyTrip", "Infosys", "TCS", "Wipro", "HCL",
    "Reliance", "Jio", "Byju's", "Upstox", "Unacademy", "Dunzo",
    "Lenskart", "PolicyBazaar", "Housing", "Urban Company",

    // Others
    "Tesla", "SpaceX", "Disney", "Hulu", "HBO", "Epic Games", "Unity",
    "Electronic Arts", "Ubisoft", "Booking.com", "Expedia", "DoorDash",
    "Instacart", "Grubhub", "Reddit", "Discord", "Twitch"
].sort();

// Get domain for a company name
export function getCompanyDomain(companyName: string): string {
    const normalized = companyName.toLowerCase().trim();

    // Check direct mapping first
    if (COMPANY_DOMAINS[normalized]) {
        return COMPANY_DOMAINS[normalized];
    }

    // Fallback: Try to guess domain from company name
    const cleaned = normalized.replace(/[^a-z0-9]/g, '');
    return `${cleaned}.com`;
}
