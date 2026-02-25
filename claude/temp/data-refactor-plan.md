# Data.ts Refactor Plan

## Current Issues
- All types and data in single file (291 lines)
- Types mixed with data exports
- Different concerns combined: business info, navigation, content, component data
- Similar interfaces (NavigationLink, MenuLink) not consolidated

## Proposed Structure

### 1. Extract Types
**File: `src/assets/redcow/types.ts`**
- All interfaces moved here
- Consolidate NavigationLink and MenuLink (they're identical)
- Group by domain (contact, navigation, content, etc.)

### 2. Split Data by Domain
**File: `src/assets/redcow/content/business.ts`**
- contact
- socialLinks
- businessInfo
- openingHours

**File: `src/assets/redcow/content/navigation.ts`**
- mainNavigation
- footerNavigation

**File: `src/assets/redcow/content/pages.ts`**
- pageMetadata
- quotes
- aboutContent
- eventsContent
- menuContent
- homeContent
- contactContent

**File: `src/assets/redcow/content/components.ts`**
- homeComponentData
- roomsComponentData
- rooms (raw data)

### 3. Create Index File
**File: `src/assets/redcow/content/index.ts`**
- Re-export everything for backward compatibility
- Consumers can import from specific files or index

## Benefits
- ✅ Better organization by domain
- ✅ Types separated from implementation
- ✅ More modular - easier to find and edit
- ✅ Smaller, focused files
- ✅ No breaking changes (index preserves imports)
- ✅ Follows Astro/TypeScript best practices

## Checklist
- [x] Create types.ts with all interfaces
- [x] Create business.ts with business data
- [x] Create navigation.ts with nav data
- [x] Create pages.ts with page content
- [x] Create components.ts with component data
- [x] Create index.ts re-exporting everything
- [x] Update data.ts to re-export from index
- [x] Verify imports still work (checked 11 files)

## Result
✅ Refactor complete - 291 lines reduced to 27 lines in data.ts
- All types now in `src/assets/redcow/types.ts`
- Business data in `content/business.ts`
- Navigation data in `content/navigation.ts`
- Page content in `content/pages.ts`
- Component data in `content/components.ts`
- Backward compatible via `content/index.ts` and `content/data.ts`
