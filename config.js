const TWITTER_MODS = {
	// Visual Theme
	theme: {
	  enabled: false,
	  description: "Theme Settings",
	  variables: {
		'--background-primary': '#000000',
		'--text-primary': '#ffffff',
		'--accent-color': '#1DA1F2',
		'--background-secondary': '#2F3336'
	  }
	},
  
	// UI Elements to Hide
	hideElements: {
	  grok: {
		enabled: false,
		description: "Remove All Grok",
		selectors: [
		  'div[data-testid="GrokDrawer"]',
		  'div[data-testid="GrokDrawerHeader"]',
		  'div[style*="position: absolute"][style*="bottom: 0"]:has(div[data-testid="GrokDrawer"])',
		  'a[aria-label="Grok"][role="link"]',
		  'button[data-testid="grokImgGen"]',
		  'div[role="presentation"]:has(button[data-testid="grokImgGen"])',
		  'button[aria-label="Grok actions"][role="button"]',
		  'button[aria-label="Profile Summary"][role="button"]'
		]
	  },
	  sidebar: {
		enabled: false,
		description: "Hide Entire Sidebar",
		selectors: [
		  'div[data-testid="sidebarColumn"]',
		  'div[class*="css-175oi2r r-aqfbo4 r-1pi2tsx r-1xcajam r-1d2f490 r-1p0dtai r-1d2f490 r-u8s1d r-zchlnj r-ipm5af"]'
		]
	  },
	  trending: {
		enabled: false,
		description: "Hide Trending Sections",
		selectors: [
		  'div[aria-label="Timeline: Trending now"]',
		  'div[aria-label="Trending"]'
		]
	  },
	  brokenSpacer: {
		enabled: false,
		description: "Hide Broken Spacer in Compose Menu",
		selectors: [
		  'div[role="presentation"]:has(div[style*="background-color: rgb(75, 78, 82)"][style*="border-radius: 9999px"])'
		]
	  },
	  userInfo: {
		  enabled: false,
		  description: "Hide All User Info",
		  selectors: [
			  'div[data-testid="Tweet-User-Avatar"]',
			  'div[data-testid="User-Name"]',
		  ],
	  },
	  communities: {
		enabled: false,
		description: "Hide Communities Tab",
		selectors: [
		  'a[aria-label="Communities"][role="link"]',
  
		  // It's fine to use an href selector: this won't match random links
		  // posted to mysite.com/mycommunities because X will convert them t.co/xyz
		  'a[href$="/communities"]'
		]
	  },
	  premium: {
		enabled: false,
		description: "Hide Premium Tab",
		selectors: [
		  'a[data-testid="premium-hub-tab"]',
		  'a[data-testid="premium-signup-tab"]',
		  'a[aria-label="Premium"][role="link"]'
		]
	  },
	  jobs: {
		enabled: false,
		description: "Hide Jobs Tab",
		selectors: [
		  'a[data-testid="jobs-tab-item"]',
		  'a[aria-label="Jobs"][role="link"]',
		  'a[href$="/jobs"]'
		]
	  },
	  articles: {
		enabled: false,
		description: "Hide Articles Tab",
		selectors: [
		  'a[href$="/compose/articles"]',
		  'a[aria-label="Articles"][role="link"]'
		]
	  },
	  explore: {
		enabled: false,
		description: "Hide Explore Tab",
		selectors: [
		  'a[data-testid="AppTabBar_Explore_Link"]',
		  'a[aria-label="Search and explore"][role="link"]'
		]
	  },
	  notifications: {
		enabled: false,
		description: "Hide Notifications Tab",
		selectors: [
		  'a[data-testid="AppTabBar_Notifications_Link"]',
		  'a[aria-label*="Notifications"][role="link"]'
		]
	  },
	  messages: {
		enabled: false,
		description: "Hide Messages Tab",
		selectors: [
		  'a[data-testid="AppTabBar_DirectMessage_Link"]',
		  'a[aria-label="Direct Messages"][role="link"]',
		  'a[href="/messages"]'
		]
	  },
	  business: {
		enabled: false,
		description: "Hide Business Tab",
		selectors: [
		  'a[aria-label="Business"][role="link"]',
		  'a[href$="i/verified-orgs-signup"]'
		],
	  },
	  communityNotes: {
		enabled: false,
		description: "Hide Community Notes Tab",
		selectors: [
		  'a[aria-label="Community Notes"][role="link"]',
		  'a[href$="i/communitynotes"]'
		]
	  },
  
	  // Engagement Metrics
	  replyCounts: {
		enabled: false,
		description: "Hide Reply Counts",
		selectors: [
		  // Hide the number inside reply buttons
		  'button[data-testid="reply"] span[data-testid="app-text-transition-container"]',
		  // Backup using aria-label pattern
		  'button[aria-label*=" Replies"][role="button"] span[data-testid="app-text-transition-container"]'
		]
	  },
	  retweetCounts: {
		enabled: false,
		description: "Hide Repost Counts",
		selectors: [
		  // Hide the number inside retweet buttons
		  'button[data-testid="retweet"] span[data-testid="app-text-transition-container"]',
		  // Backup using aria-label pattern
		  'button[aria-label*=" reposts"][role="button"] span[data-testid="app-text-transition-container"]'
		]
	  },
	  likeCounts: {
		enabled: false,
		description: "Hide Like Counts",
		selectors: [
		  // Hide numbers in both liked and unliked states
		  'button[data-testid="like"] span[data-testid="app-text-transition-container"]',
		  'button[data-testid="unlike"] span[data-testid="app-text-transition-container"]',
		  // Backup using aria-label pattern
		  'button[aria-label*=" Likes"][role="button"] span[data-testid="app-text-transition-container"]'
		]
	  },
	  viewCounts: {
		enabled: false,
		description: "Hide View Counts",
		selectors: [
		  // Target analytics link view counts
		  'a[href$="/analytics"] span[data-testid="app-text-transition-container"]',
		  // Backup using aria-label
		  'a[aria-label*="views"][aria-label*="View post analytics"] span[data-testid="app-text-transition-container"]',
		  // Additional backup using the specific view count icon
		  'a[href$="/analytics"]:has(svg path[d*="M8.75 21V3h2v18h-2z"]) span[data-testid="app-text-transition-container"]'
		]
	  }
	},
  
	// UI Element Replacements
	replaceElements: {
	  xLogo: {
		enabled: false,
		description: "Use Twitter Bird Logo",
		type: 'logoReplace',
		target: 'a[aria-label="X"]',
		replacementData: {
		  svg: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="%231DA1F2"><path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"/></svg>`,
		  width: '24px',
		  height: '24px'
		}
	  },
	  tweetButtonHome: {
		enabled: false,
		description: "Replace 'Post' with 'Tweet' (Home)",
		type: 'buttonReplace',
		target: 'button[data-testid="tweetButtonInline"]',
		replacementData: {
		  text: 'Tweet',
		  styles: `
			/* Button width and text alignment */
			button[data-testid="tweetButtonInline"] {
			  min-width: 56px !important;
			  width: auto !important;
			  padding: 0 12px !important;
			  height: 32px !important;
			  margin-left: 12px !important;
			}
			button[data-testid="tweetButtonInline"] div {
			  justify-content: center !important;
			  align-items: center !important;
			  width: 100% !important;
			}
			button[data-testid="tweetButtonInline"] span.css-1jxf684 {
			  display: flex !important;
			  justify-content: center !important;
			  align-items: center !important;
			  width: 100% !important;
			}
			/* Empty the text content */
			button[data-testid="tweetButtonInline"] span.css-1jxf684 span.r-poiln3 {
			  text-indent: -9999px !important;
			  font-size: 0 !important;
			}
			button[data-testid="tweetButtonInline"] span.css-1jxf684 span::before {
			  position: static !important;
			  transform: none !important;
			  white-space: nowrap !important;
			  content: 'Tweet' !important;
			  text-indent: 0 !important;
			  font-size: 14px !important;
			}
			/* Active state */
			button[data-testid="tweetButtonInline"]:not([disabled]) {
			  background-color: rgb(29, 155, 240) !important;
			}
			button[data-testid="tweetButtonInline"]:not([disabled]) div {
			  color: rgb(255, 255, 255) !important;
			}
			/* Disabled state */
			button[data-testid="tweetButtonInline"][disabled] {
			  background-color: rgba(29, 155, 240, 0.4) !important;
			}
			button[data-testid="tweetButtonInline"][disabled] div {
			  color: rgb(255, 255, 255) !important;
			}
		  `
		}
	  },
	  tweetButtonSidebar: {
		enabled: false,
		description: "Replace 'Post' with 'Tweet' (Left)",
		type: 'buttonReplace',
		target: 'a[data-testid="SideNav_NewTweet_Button"]',
		replacementData: {
		  text: 'Tweet',
		  styles: `
			a[data-testid="SideNav_NewTweet_Button"] span.css-1jxf684 span.css-1jxf684 {
			  display: flex !important;
			  justify-content: center !important;
			  align-items: center !important;
			  width: 100% !important;
			}
			/* Empty the text content */
			a[data-testid="SideNav_NewTweet_Button"] span.css-1jxf684 span.r-poiln3 {
			  text-indent: -9999px !important;
			  font-size: 0 !important;
			}
			a[data-testid="SideNav_NewTweet_Button"] span.css-1jxf684 span.css-1jxf684 span::before {
			  position: static !important;
			  transform: none !important;
			  white-space: nowrap !important;
			  content: 'Tweet' !important;
			  text-indent: 0 !important;
			  font-size: 17px !important;
			}
			/* Active state */
			a[data-testid="SideNav_NewTweet_Button"]:not([disabled]) {
			  background-color: rgb(29, 155, 240) !important;
			}
			a[data-testid="SideNav_NewTweet_Button"]:not([disabled]) div {
			  color: rgb(255, 255, 255) !important;
			}
  
			/* Since we're already changing it to blue, also set the glyph color
			(used when the window width is small) */
			a[data-testid="SideNav_NewTweet_Button"] svg, a[data-testid="SideNav_NewTweet_Button"] div[dir="ltr"] {
			  color: white !important;
			}
		  `
		}
	  },
	  tweetButtonPopup: {
		enabled: false,
		description: "Replace 'Post' with 'Tweet' (Compose Popup)",
		type: 'buttonReplace',
		target: 'button[data-testid="tweetButton"]',
		replacementData: {
		  text: 'Tweet',
		  styles: `
			/* Button width and text alignment */
			button[data-testid="tweetButton"] {
			  min-width: 56px !important;
			  width: auto !important;
			  padding: 0 12px !important;
			  height: 32px !important;
			  margin-left: 12px !important;
			}
			button[data-testid="tweetButton"] div {
			  justify-content: center !important;
			  align-items: center !important;
			  width: 100% !important;
			}
			button[data-testid="tweetButton"] span.css-1jxf684 {
			  display: flex !important;
			  justify-content: center !important;
			  align-items: center !important;
			  width: 100% !important;
			}
			/* Empty the text content */
			button[data-testid="tweetButton"] span.css-1jxf684 span.r-poiln3 {
			  text-indent: -9999px !important;
			  font-size: 0 !important;
			}
			button[data-testid="tweetButton"] span.css-1jxf684 span::before {
			  position: static !important;
			  transform: none !important;
			  white-space: nowrap !important;
			  content: 'Tweet' !important;
			  text-indent: 0 !important;
			  font-size: 14px !important;
			}
			/* Active state */
			button[data-testid="tweetButton"]:not([disabled]) {
			  background-color: rgb(29, 155, 240) !important;
			}
			button[data-testid="tweetButton"]:not([disabled]) div {
			  color: rgb(255, 255, 255) !important;
			}
			/* Disabled state */
			button[data-testid="tweetButton"][disabled] {
			  background-color: rgba(29, 155, 240, 0.4) !important;
			}
			button[data-testid="tweetButton"][disabled] div {
			  color: rgb(255, 255, 255) !important;
			}
		  `
		}
	  }
	},
	
	// Style Fixes
	styleFixes: {
	  centerLayout: {
		enabled: false,
		description: "Center Main Content",
		selectors: [
		  'div[data-testid="primaryColumn"]',
		  'div[data-testid="primaryColumn"] > div'
		],
		styles: `
		  margin: 0 auto !important;
		  float: none !important;
		  width: 100% !important;
		  max-width: 600px !important;
		  flex-grow: 1 !important;
		  flex-basis: auto !important;
		  flex-direction: column !important;
		  flex-shrink: 0 !important;
		  -webkit-box-flex: 0 !important;
		`
	  },
	  badgeColor: {
		enabled: false,
		description: "Fix Badge Color to Twitter Blue",
		selectors: [
		  'div[aria-label*="unread items"]',
		  'div[aria-label*="New items"]'
		],
		styles: `
		  background-color: rgb(29, 155, 240) !important;
		`
	  },
	  unreadBadge: {
		enabled: false,
		description: "Fix Unread Message Badge Color",
		selectors: [
		  'div[class*="r-sdzlij"][class*="r-1f4tc2a"][class*="r-1phboty"]'
		],
		styles: `
		  background-color: rgb(29, 155, 240) !important;
		`
	  }
	},
  
	// Button Colors
	buttonColors: {
	  composeButton: {
		enabled: false,
		description: "Fix Compose Button Colors",
		selectors: {
		  button: 'a[data-testid="SideNav_NewTweet_Button"]',
		  icon: 'a[data-testid="SideNav_NewTweet_Button"] svg, a[data-testid="SideNav_NewTweet_Button"] div[dir="ltr"]'
		},
		styles: {
		  button: `
			background-color: rgb(29, 155, 240) !important;
			border-color: rgb(29, 155, 240) !important;
		  `,
		  icon: `
			color: rgb(255, 255, 255) !important;
		  `
		}
	  }
	}
  }; 
  