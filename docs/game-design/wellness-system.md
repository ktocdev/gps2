# Wellness Rating System - Strategic Design

## Overview
Internal wellness calculation system that creates consequences for poor guinea pig care through friendship penalties, encouraging balanced holistic care without explicit wellness meters.

## Core Mechanics

### Balanced Care Requirement
- **Holistic care approach:** Players must maintain all 7 needs rather than neglecting some for others
- **No selective attention:** Cannot focus only on favorite needs while ignoring others
- **Equal importance:** All needs contribute equally to overall guinea pig wellness
- **Comprehensive responsibility:** Encourages complete pet care simulation

### Consequence Feedback Loop
- **Poor care damages relationship:** Overall neglect affects guinea pig friendship through wellness penalties
- **Invisible calculation:** Wellness calculated internally without direct player visibility
- **Friendship as indicator:** Friendship meter serves as primary feedback mechanism
- **Natural consequences:** Poor care leads to relationship deterioration

### Progressive Difficulty
- **Downward spiral mechanics:** As friendship decreases, interactions become less effective
- **Compounding problems:** Lower friendship makes it harder to satisfy needs effectively
- **Motivation for improvement:** Players naturally want to restore positive relationship
- **Escalating consequences:** Continued neglect accelerates relationship damage

### Recovery Opportunity
- **Improvement rewards:** Players can recover by improving overall wellness
- **Penalty cessation:** Wellness above threshold immediately stops friendship penalties
- **Rebuilding process:** Positive interactions more effective once baseline care restored
- **Hope and redemption:** Always possible to restore relationship through better care

## Mathematical Foundation

### Wellness Calculation
```
Wellness = Average of all needs (hunger, thirst, happiness, cleanliness, health, energy, social)
```
- **Calculated internally** - never displayed to player
- **Real-time computation** during each game tick
- **Equal weighting** of all 7 needs for balanced importance
- **Range:** 0-100 scale matching individual need scales

### Penalty Thresholds
- **Penalty Threshold:** Wellness < 45% triggers friendship loss
- **Warning Threshold:** Wellness < 50% provides contextual warnings
- **Recovery Threshold:** Wellness > 55% stops penalties and enables recovery
- **Bonus Threshold:** Wellness > 75% provides friendship bonuses

### Penalty Rates
- **Base Rate:** -0.5 to -1 friendship per game tick
- **Adjustable for balance:** Configurable based on playtesting feedback
- **Graduated penalties:** Worse wellness = faster friendship loss
- **Immediate application:** Real-time friendship impact during game loop

### Player Feedback
- **Contextual warnings:** Alerts when wellness < 50% (approaching penalty range)
- **Friendship meter integration:** Shows penalty effects with trend indicators
- **No direct wellness display:** Players infer wellness from friendship changes
- **Natural discovery:** Players learn care patterns through relationship feedback

## Gameplay Impact

### Strategic Depth
- **Holistic care strategy:** Forces comprehensive pet care approach
- **Resource allocation:** Players must balance time and attention across all needs
- **Priority management:** Learn to identify and address critical needs quickly
- **Preventive care:** Rewards for maintaining needs before they become critical

### Discovery-Based Learning
- **Observational learning:** Players discover care patterns through guinea pig responses
- **Contextual hints:** Subtle guidance through friendship changes and warnings
- **Natural intuition:** Develop understanding without explicit instruction
- **Personal mastery:** Each player discovers their own optimal care routines

### Emotional Investment
- **Relationship stakes:** Friendship damage creates genuine concern and motivation
- **Care motivation:** Players actively want to improve guinea pig happiness
- **Recovery satisfaction:** Rebuilding relationship provides meaningful accomplishment
- **Realistic bonding:** Mimics real pet relationship development

### Skill Development
- **Care intuition:** Players develop instinctive understanding of guinea pig needs
- **Pattern recognition:** Learn to identify needs through behavioral cues
- **Timing mastery:** Develop optimal care routines and timing
- **Efficiency improvement:** Learn to maintain wellness with minimal effort

### Realistic Simulation
- **Natural pet relationship:** No artificial wellness meters or explicit scoring
- **Behavioral feedback:** Relationship quality reflected in guinea pig behavior
- **Organic discovery:** Players learn care through observation and interaction
- **Intuitive understanding:** Care quality becomes instinctive rather than calculated

### Long-term Engagement
- **Relationship recovery:** Meaningful progression goals for improving friendship
- **Continuous improvement:** Always opportunities to optimize care patterns
- **Personal investment:** Strong emotional connection to guinea pig wellbeing
- **Mastery progression:** Advanced players develop expertise in guinea pig care

## Design Philosophy

### Hidden Complexity
- **Simple interface:** No complex meters or explicit wellness tracking
- **Sophisticated backend:** Advanced calculations provide nuanced feedback
- **Natural presentation:** Wellness effects presented through behavior and relationship
- **Intuitive understanding:** Players understand system without seeing mechanics

### Positive Reinforcement
- **Improvement rewards:** Better care immediately improves relationship
- **Recovery possibility:** Always hope for relationship restoration
- **Achievement satisfaction:** Mastering care provides genuine accomplishment
- **Care motivation:** System encourages rather than punishes

### Realistic Pet Care
- **Holistic responsibility:** Mimics real pet care requirements
- **Relationship building:** Authentic pet bonding simulation
- **Consequence learning:** Natural cause-and-effect teaching
- **Care development:** Progressive learning of pet care skills

## Implementation Benefits

### Player Experience
- **Clean interface:** No cluttered meters or explicit wellness tracking
- **Natural learning:** Discover optimal care through play rather than instruction
- **Emotional engagement:** Genuine concern for guinea pig wellbeing
- **Long-term motivation:** Relationship building provides sustained engagement

### Development Advantages
- **Flexible balancing:** Adjust thresholds and penalties without UI changes
- **Analytics opportunities:** Track player care patterns for optimization
- **Difficulty scaling:** Modify challenge without changing core interface
- **Feature expansion:** Add new needs without UI complexity increase

### Educational Value
- **Real pet care skills:** Transfer learning to actual pet ownership
- **Responsibility development:** Teach consistent care habits
- **Empathy building:** Understand pet needs and emotions
- **Care technique:** Learn optimal pet care practices through simulation