# Clothing Exchange & Swap Marketplace PRD

## Overview
SwapWear is a clothing exchange marketplace that helps users swap wearable clothes instead of buying new items. The product supports sustainable fashion by making item listing, browsing, swap requests, negotiation, and local or courier exchange simple.

## Problem
Many users own good-condition clothes they no longer wear, but selling or donating them can be inconvenient. Existing commerce platforms focus on buying and selling, not direct barter-style exchanges.

## Objectives
- Provide a dedicated clothing exchange marketplace.
- Enable direct clothing swaps without payments.
- Support sustainable fashion and reuse.
- Provide location-based matching and filters.
- Support fair swap value estimation and comparison.
- Allow negotiation before finalizing swaps.
- Give admins tools to manage users, listings, swaps, and platform analytics.

## In Scope
- Registration and login.
- User profile management.
- Clothing listing creation, editing, and removal.
- Image upload flow.
- Browse listings with search, category, size, condition, location, and value sorting.
- Item detail page with owner details, estimated value, nearby matches, and fair-value matches.
- Swap request flow with value comparison and exchange method selection.
- Incoming/outgoing swap management.
- Chat for negotiation, including optional Gemini AI assistant replies.
- Admin panel for users, listings, swaps, and analytics.

## Out of Scope for Phase 1
- Online payment processing.
- AR virtual try-on.
- Native mobile apps.
- Production-grade courier API integration.
- Production persistent database setup.

## User Flow
1. User registers or logs in.
2. User creates or edits profile.
3. User lists clothing with brand, size, condition, value, photos, and location.
4. User browses listings and filters by category/location/condition/size.
5. User opens item details and reviews value and location match indicators.
6. User sends swap request with one of their own items.
7. User selects local meetup or courier exchange.
8. Users negotiate in chat.
9. Request is accepted, rejected, or completed.

## Admin Flow
1. Admin opens dashboard.
2. Admin reviews platform KPIs.
3. Admin manages users.
4. Admin reviews/removes listings.
5. Admin monitors swap activity.

## Key Data
- User: id, name, email, bio, location, role, status, swap count.
- Listing: id, title, description, category, brand, size, condition, estimated value, images, location, owner, status.
- Swap: id, offered item, requested item, requester, target user, status, message, delivery method, value difference, courier estimate.
- Chat: room id, sender, text, timestamp.

## KPIs
- Total users.
- Total active listings.
- Total swaps.
- Pending swaps.
- Completed swaps.
- Swap success rate.

## Acceptance Checklist
- 6-8 interconnected pages exist: Home, Auth, Browse, Item Detail, Swaps, Chat, Dashboard, Admin.
- Realistic clothing data is available.
- Browse filters and sorting work.
- Swap requests can be sent and managed.
- Chat supports negotiation.
- Value estimate and value comparison are shown.
- Location matching and nearby filtering are present.
- Admin analytics and management are present.
- UI is responsive and can run locally.
