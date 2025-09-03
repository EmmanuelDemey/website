---
title: Recoil, a Next-Generation State Management
type: Talk
date: 03/25/2021
image: https://secure.meetupstatic.com/photos/event/6/b/4/8/highres_495087464.jpeg
youtube: hfcm8pUrzp4
---

If you are a React.js developer, there’s probably no doubt — if you’re reading this abstract, you are most likely already familiar with the concept of state management. Popularized through the Redux pattern and the React-Redux library, this concept allows us to centralize the management of the data used by our application.

The data? All the data? Unfortunately, in most applications I’ve worked on, that’s exactly the case. We’ve gotten used to centralizing everything, just in case several components might need the same information. And of course, that’s rarely true.

We’ve become so accustomed to centralizing everything that adding support for a new piece of data requires modifying multiple files — implementing actions, reducers, selectors, and more. The structuring benefit that these solutions were supposed to bring has instead turned our applications into a real spaghetti mess, hard to understand for newcomers.

Since then, other solutions have appeared, such as MobX. In this talk, I’d like to introduce you to the latest one: Recoil. Through live coding and a deep dive into its internals, we’ll explore the advantages and drawbacks of this new project developed at Facebook.
