import type { MessageCategory } from '../stores/loggingStore'

// Message templates organized by category
interface MessageTemplate {
  message: string
  emoji?: string
  weight?: number // For random selection weighting (default: 1)
}

// Player Action Messages
const playerActionTemplates: MessageTemplate[] = [
  { message: "You place a cherry tomato in the food dish", emoji: "🍅" },
  { message: "You offer your guinea pig a strawberry treat", emoji: "🍓" },
  { message: "You gently pet your guinea pig behind the ears", emoji: "👋" },
  { message: "You clean the cage thoroughly", emoji: "🧽" },
  { message: "You refresh the bedding with botanical hay", emoji: "🌿" },
  { message: "You fill the water bottle with fresh water", emoji: "💧" },
  { message: "You place a cozy hideout in the corner", emoji: "🏠" },
  { message: "You add some fresh timothy hay to the feeder", emoji: "🌾" },
  { message: "You give your guinea pig a gentle belly rub", emoji: "🤗" },
  { message: "You scatter some pellets in the food bowl", emoji: "🥄" },
  { message: "You arrange a comfortable resting area", emoji: "🛏️" },
  { message: "You place a new chew toy near the hideout", emoji: "🧸" }
]

// Guinea Pig Reaction Messages
const guineaPigReactionTemplates: MessageTemplate[] = [
  { message: "Guinea pig popcorns excitedly! ✨", emoji: "🐹" },
  { message: "Guinea pig turns nose up at the broccoli", emoji: "😤" },
  { message: "Guinea pig munches happily - nom nom nom!", emoji: "😋" },
  { message: "Guinea pig purrs contentedly during petting", emoji: "😌" },
  { message: "Guinea pig wheeks loudly for more treats!", emoji: "📢" },
  { message: "Guinea pig sniffs the new item curiously", emoji: "👃" },
  { message: "Guinea pig does a happy dance!", emoji: "💃" },
  { message: "Guinea pig chatters teeth in excitement", emoji: "😁" },
  { message: "Guinea pig stretches out in total relaxation", emoji: "😴" },
  { message: "Guinea pig makes soft rumbling sounds", emoji: "🎵" },
  { message: "Guinea pig's eyes sparkle with joy", emoji: "✨" },
  { message: "Guinea pig tilts head thoughtfully", emoji: "🤔" }
]

// Autonomous Behavior Messages
const autonomousBehaviorTemplates: MessageTemplate[] = [
  { message: "Guinea pig runs to the water bottle and drinks", emoji: "🏃" },
  { message: "Guinea pig investigates the new tunnel curiously", emoji: "🔍" },
  { message: "Guinea pig does zoomies around the cage!", emoji: "💨" },
  { message: "Guinea pig stretches and yawns in the sunbeam", emoji: "☀️" },
  { message: "Guinea pig hides in the cozy shelter", emoji: "🏠" },
  { message: "Guinea pig nibbles on some timothy hay", emoji: "🌾" },
  { message: "Guinea pig explores every corner of the habitat", emoji: "🗺️" },
  { message: "Guinea pig settles down for a peaceful nap", emoji: "😴" },
  { message: "Guinea pig grooms their fur meticulously", emoji: "🧽" },
  { message: "Guinea pig claims the food bowl as their throne", emoji: "👑" },
  { message: "Guinea pig performs acrobatic leaps and bounds", emoji: "🤸" },
  { message: "Guinea pig organizes their bedding just right", emoji: "🏗️" }
]

// Environmental Event Messages
const environmentalEventTemplates: MessageTemplate[] = [
  { message: "The bedding freshness is getting low", emoji: "🌿" },
  { message: "Guinea pig drops a poop near the food dish", emoji: "💩" },
  { message: "Water level needs attention", emoji: "💧" },
  { message: "The cage could use a good cleaning", emoji: "🧽" },
  { message: "The hay supply is running low", emoji: "🌾" },
  { message: "A pleasant breeze flows through the habitat", emoji: "🌬️" },
  { message: "The temperature feels just right", emoji: "🌡️" },
  { message: "Sunlight streams in, creating a warm spot", emoji: "☀️" },
  { message: "The food dish is looking empty", emoji: "🍽️" },
  { message: "Fresh air circulates through the space", emoji: "💨" },
  { message: "The hideout could use some fresh bedding", emoji: "🏠" },
  { message: "A quiet, peaceful atmosphere settles in", emoji: "🌙" }
]

// Achievement Messages
const achievementTemplates: MessageTemplate[] = [
  { message: "🏆 Achievement unlocked: First Pet!", emoji: "🏆" },
  { message: "🏆 Achievement unlocked: Happy Guinea Pig!", emoji: "🏆" },
  { message: "🏆 Achievement unlocked: Excellent Caretaker!", emoji: "🏆" },
  { message: "🏆 Achievement unlocked: Preference Detective!", emoji: "🏆" },
  { message: "🏆 Achievement unlocked: Clean Home Master!", emoji: "🏆" },
  { message: "🏆 Achievement unlocked: Guinea Pig Whisperer!", emoji: "🏆" },
  { message: "🏆 Achievement unlocked: Devoted Friend!", emoji: "🏆" },
  { message: "🏆 Achievement unlocked: Habitat Designer!", emoji: "🏆" },
  { message: "🏆 Achievement unlocked: Nutrition Expert!", emoji: "🏆" },
  { message: "🏆 Achievement unlocked: Comfort Specialist!", emoji: "🏆" }
]

// Template collections
const messageTemplates: Record<MessageCategory, MessageTemplate[]> = {
  player_action: playerActionTemplates,
  guinea_pig_reaction: guineaPigReactionTemplates,
  autonomous_behavior: autonomousBehaviorTemplates,
  environmental: environmentalEventTemplates,
  achievement: achievementTemplates,
  system: [] // System messages are generated directly, not from templates
}

// Message generation functions
export class MessageGenerator {
  private static getRandomTemplate(templates: MessageTemplate[]): MessageTemplate {
    if (templates.length === 0) {
      return { message: "Something happened", emoji: "💭" }
    }

    // Use weight-based selection if weights are provided
    const hasWeights = templates.some(t => t.weight !== undefined)

    if (hasWeights) {
      const totalWeight = templates.reduce((sum, t) => sum + (t.weight || 1), 0)
      let random = Math.random() * totalWeight

      for (const template of templates) {
        random -= (template.weight || 1)
        if (random <= 0) {
          return template
        }
      }
    }

    // Simple random selection
    const randomIndex = Math.floor(Math.random() * templates.length)
    return templates[randomIndex]
  }

  static generatePlayerAction(
    action?: string,
    item?: string,
    customEmoji?: string
  ): { message: string; emoji?: string } {
    if (action && item) {
      // Generate custom message based on action and item
      return {
        message: `You ${action} ${item}`,
        emoji: customEmoji || "👆"
      }
    }

    const template = this.getRandomTemplate(messageTemplates.player_action)
    return {
      message: template.message,
      emoji: template.emoji
    }
  }

  static generateGuineaPigReaction(
    reaction?: string,
    intensity?: 'mild' | 'moderate' | 'strong'
  ): { message: string; emoji?: string } {
    if (reaction) {
      const intensityModifiers = {
        mild: ['slightly', 'gently', 'softly'],
        moderate: ['', 'noticeably', 'clearly'],
        strong: ['very', 'extremely', 'intensely']
      }

      const modifier = intensity ?
        intensityModifiers[intensity][Math.floor(Math.random() * intensityModifiers[intensity].length)] : ''

      return {
        message: `Guinea pig ${modifier} ${reaction}`.trim(),
        emoji: "🐹"
      }
    }

    const template = this.getRandomTemplate(messageTemplates.guinea_pig_reaction)
    return {
      message: template.message,
      emoji: template.emoji
    }
  }

  static generateAutonomousBehavior(
    behavior?: string
  ): { message: string; emoji?: string } {
    if (behavior) {
      return {
        message: `Guinea pig ${behavior}`,
        emoji: "🎯"
      }
    }

    const template = this.getRandomTemplate(messageTemplates.autonomous_behavior)
    return {
      message: template.message,
      emoji: template.emoji
    }
  }

  static generateEnvironmentalEvent(
    event?: string,
    severity?: 'low' | 'medium' | 'high'
  ): { message: string; emoji?: string } {
    if (event) {
      const severityPrefixes = {
        low: ['Notice:', 'Reminder:'],
        medium: ['Alert:', 'Attention:'],
        high: ['Warning:', 'Urgent:']
      }

      const prefix = severity ?
        severityPrefixes[severity][Math.floor(Math.random() * severityPrefixes[severity].length)] : ''

      return {
        message: prefix ? `${prefix} ${event}` : event,
        emoji: severity === 'high' ? "⚠️" : "🌿"
      }
    }

    const template = this.getRandomTemplate(messageTemplates.environmental)
    return {
      message: template.message,
      emoji: template.emoji
    }
  }

  static generateAchievement(
    achievementName: string,
    description?: string
  ): { message: string; emoji?: string } {
    const baseMessage = `🏆 Achievement unlocked: ${achievementName}!`
    const fullMessage = description ? `${baseMessage} ${description}` : baseMessage

    return {
      message: fullMessage,
      emoji: "🏆"
    }
  }

  // Preference-based message generation
  static generatePreferenceReaction(
    item: string,
    preference: 'love' | 'like' | 'neutral' | 'dislike' | 'hate',
    isNewDiscovery: boolean = false
  ): { message: string; emoji?: string } {
    const reactions = {
      love: [
        `Guinea pig absolutely adores the ${item}!`,
        `Guinea pig's eyes light up at the sight of ${item}!`,
        `Guinea pig does a joyful popcorn dance for the ${item}!`
      ],
      like: [
        `Guinea pig enjoys the ${item}`,
        `Guinea pig seems pleased with the ${item}`,
        `Guinea pig munches the ${item} contentedly`
      ],
      neutral: [
        `Guinea pig accepts the ${item} without much reaction`,
        `Guinea pig sniffs the ${item} thoughtfully`,
        `Guinea pig tries the ${item} cautiously`
      ],
      dislike: [
        `Guinea pig turns away from the ${item}`,
        `Guinea pig sniffs the ${item} and walks away`,
        `Guinea pig seems uninterested in the ${item}`
      ],
      hate: [
        `Guinea pig completely rejects the ${item}!`,
        `Guinea pig makes a face at the ${item}`,
        `Guinea pig pushes the ${item} away with their nose`
      ]
    }

    const emojis = {
      love: "😍",
      like: "😊",
      neutral: "🤔",
      dislike: "😐",
      hate: "🙄"
    }

    const reactionMessages = reactions[preference]
    const message = reactionMessages[Math.floor(Math.random() * reactionMessages.length)]
    const discoveryPrefix = isNewDiscovery ? "✨ Discovery: " : ""

    return {
      message: `${discoveryPrefix}${message}`,
      emoji: emojis[preference]
    }
  }

  // Context-aware message generation
  static generateContextualMessage(
    context: {
      category: MessageCategory
      action?: string
      item?: string
      preference?: string
      intensity?: string
      isFirstTime?: boolean
    }
  ): { message: string; emoji?: string } {
    switch (context.category) {
      case 'player_action':
        return this.generatePlayerAction(context.action, context.item)

      case 'guinea_pig_reaction':
        return this.generateGuineaPigReaction(
          context.action,
          context.intensity as 'mild' | 'moderate' | 'strong'
        )

      case 'autonomous_behavior':
        return this.generateAutonomousBehavior(context.action)

      case 'environmental':
        return this.generateEnvironmentalEvent(
          context.action,
          context.intensity as 'low' | 'medium' | 'high'
        )

      case 'achievement':
        return this.generateAchievement(context.action || 'Unknown Achievement')

      default:
        return { message: "Something interesting happened", emoji: "💭" }
    }
  }

  // Get all available templates for a category (useful for testing)
  static getTemplatesForCategory(category: MessageCategory): MessageTemplate[] {
    return messageTemplates[category] || []
  }

  // Add new template to a category (for extensibility)
  static addTemplate(category: MessageCategory, template: MessageTemplate): void {
    if (!messageTemplates[category]) {
      messageTemplates[category] = []
    }
    messageTemplates[category].push(template)
  }

  // Action-specific message generators for guinea pig interactions
  static generateFeedMessage(
    guineaPigName: string,
    foodType: string,
    isFavorite: boolean = false
  ): { message: string; emoji: string } {
    const foodEmojis: Record<string, string> = {
      pellets: '🥄',
      vegetables: '🥬',
      fruits: '🍓',
      hay: '🌾'
    }

    const templates = [
      `You offer ${guineaPigName} some ${foodType}`,
      `${guineaPigName} gets a serving of fresh ${foodType}`,
      `You place ${foodType} in ${guineaPigName}'s dish`,
      `You scatter ${foodType} for ${guineaPigName}`,
      `${guineaPigName} receives ${foodType}`
    ]

    if (isFavorite) {
      templates.push(
        `${guineaPigName} gets their favorite: ${foodType}! ✨`,
        `You treat ${guineaPigName} to their beloved ${foodType}!`,
        `${guineaPigName}'s eyes light up at the ${foodType}!`
      )
    }

    const message = templates[Math.floor(Math.random() * templates.length)]
    const emoji = foodEmojis[foodType] || '🍽️'

    return { message, emoji }
  }

  static generateWaterMessage(guineaPigName: string): { message: string; emoji: string } {
    const templates = [
      `You fill ${guineaPigName}'s water bottle with fresh water`,
      `${guineaPigName} gets clean, refreshing water`,
      `You refresh ${guineaPigName}'s water supply`,
      `${guineaPigName} receives fresh water`,
      `You ensure ${guineaPigName} has plenty of water`
    ]

    const message = templates[Math.floor(Math.random() * templates.length)]
    return { message, emoji: '💧' }
  }

  static generateCleanMessage(guineaPigName: string): { message: string; emoji: string } {
    const templates = [
      `You give ${guineaPigName} a gentle cleaning`,
      `${guineaPigName} gets groomed and pampered`,
      `You brush ${guineaPigName}'s fur lovingly`,
      `${guineaPigName} gets a spa treatment`,
      `You clean ${guineaPigName} with care`
    ]

    const message = templates[Math.floor(Math.random() * templates.length)]
    return { message, emoji: '🧼' }
  }

  static generatePlayMessage(
    guineaPigName: string,
    activityType: string = 'general_play',
    isFavorite: boolean = false
  ): { message: string; emoji: string } {
    const templates = [
      `You play with ${guineaPigName}`,
      `${guineaPigName} enjoys playtime with you`,
      `You engage ${guineaPigName} in fun activities`,
      `${guineaPigName} has a delightful play session`,
      `You spend quality time playing with ${guineaPigName}`
    ]

    if (isFavorite) {
      templates.push(
        `You do ${guineaPigName}'s favorite activity together!`,
        `${guineaPigName} is thrilled with their favorite game!`
      )
    }

    const message = templates[Math.floor(Math.random() * templates.length)]
    return { message, emoji: '🎮' }
  }

  static generateChewToyMessage(guineaPigName: string): { message: string; emoji: string } {
    const templates = [
      `You give ${guineaPigName} a new chew toy`,
      `${guineaPigName} receives a fresh chew toy`,
      `You place a chew toy for ${guineaPigName}`,
      `${guineaPigName} gets something to gnaw on`,
      `You provide ${guineaPigName} with a chew toy`
    ]

    const message = templates[Math.floor(Math.random() * templates.length)]
    return { message, emoji: '🦷' }
  }

  static generateTrimNailsMessage(
    guineaPigName: string,
    wasSuccessful: boolean
  ): { message: string; emoji: string } {
    const templates = wasSuccessful ? [
      `You successfully trim ${guineaPigName}'s nails`,
      `${guineaPigName} sits still for a nail trim`,
      `You carefully trim ${guineaPigName}'s nails`,
      `${guineaPigName} gets a pedicure`,
      `You gently trim ${guineaPigName}'s tiny nails`
    ] : [
      `You attempt to trim ${guineaPigName}'s nails`,
      `${guineaPigName} squirms during the nail trim`,
      `You try your best with ${guineaPigName}'s nails`,
      `${guineaPigName} isn't cooperating with nail trimming`
    ]

    const message = templates[Math.floor(Math.random() * templates.length)]
    return { message, emoji: '✂️' }
  }

  static generateShelterMessage(guineaPigName: string): { message: string; emoji: string } {
    const templates = [
      `You arrange a cozy shelter for ${guineaPigName}`,
      `${guineaPigName} gets a comfortable hideout`,
      `You set up a safe space for ${guineaPigName}`,
      `${guineaPigName} receives a secure hideaway`,
      `You create a peaceful retreat for ${guineaPigName}`
    ]

    const message = templates[Math.floor(Math.random() * templates.length)]
    return { message, emoji: '🏠' }
  }

  static generateSootheToSleepMessage(guineaPigName: string): { message: string; emoji: string } {
    const templates = [
      `You gently soothe ${guineaPigName} to sleep`,
      `${guineaPigName} drifts off peacefully`,
      `You help ${guineaPigName} settle down for a nap`,
      `${guineaPigName} relaxes and falls asleep`,
      `You create a calm environment for ${guineaPigName} to rest`
    ]

    const message = templates[Math.floor(Math.random() * templates.length)]
    return { message, emoji: '😴' }
  }
}

// Convenience functions for direct use
export const generatePlayerAction = MessageGenerator.generatePlayerAction
export const generateGuineaPigReaction = MessageGenerator.generateGuineaPigReaction
export const generateAutonomousBehavior = MessageGenerator.generateAutonomousBehavior
export const generateEnvironmentalEvent = MessageGenerator.generateEnvironmentalEvent
export const generateAchievement = MessageGenerator.generateAchievement
export const generatePreferenceReaction = MessageGenerator.generatePreferenceReaction
export const generateContextualMessage = MessageGenerator.generateContextualMessage