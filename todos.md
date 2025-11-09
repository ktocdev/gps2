# GPS2 Todos - Active Sprint

See [docs/SPRINT-2025-11-04.md](docs/SPRINT-2025-11-04.md) for full sprint details.

## Quick Reference

All items have been organized and prioritized in the new sprint document.

**Active Sprint:** November 4, 2025
**Branch:** GPS2-43

**Sprint Focus:**
- Code audit of SPRINT-2025-11-03 work
- CSS audit of modified components
- Begin Phase 5 implementation

New To Dos:

Ui Updates
- "guinea pig" sidebar replaces socialize. it will always show the panel contents even if a guinea pig is not selected. if a guinea pig is selected, it will open on that guinea pig. it will have the same toggle button for the guinea pigs as the other sidebar. clicking a trigger button in the guinea pig profile panel will automatically select the guinea pig the trigger was for in the habitat. it will display Your Friendship, Companionship Bond, the Trigger actions (the buttons should not be full width, they should be their natural width and not wrap after each button)

Wellness & Friendship Effects on User Interactions, Rejections, and Behaviors
- guinea pig rejects interaction (seen in activity message) but the chat bubble still had a positive message
- it also said it rejected because of low wellness but the wellness seemed ok. it should reject interactions because: 1) low friendship 2) low wellness 3) cage conditions
- 1) guinea pig's personality causes friendship to be slower to increase (not friendly/not bold guinea pigs will need more time and specific gentler interactions to grow friendship, and friendly/bold will accept pets and holding immediately); 2. wellness when low (below 50%) will cause guinea pigs to reject certain interactions like pet and hold. they will always accept food and being cleaned not matter the wellness 3. if the cage conditions as too low (below 50%) they guinea pig will reject interactions
- hiding behavior should increase when guinea pig has low wellness or low cage conditions

Bugs
- the chat bubbles are getting cut off in the habitat's overflow
- remove refresh bedding button, clean cage is enough

- sometimes the guinea pig will rest on items and not interact with them. it is a bit confusing. maybe if a guinea pig happens to stop on an item, it should just automatically do the interaction? langing on an item should trigger the interaction. landing on a toy, the guinea pig will "play" with it. same for chew. shelters and beds will be more casual "hang out in/on", "relaxes in", "chills out". 

