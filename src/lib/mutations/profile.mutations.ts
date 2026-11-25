import { gql } from '@apollo/client';

export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      name
      email
      username
      bio
      image
      coverImage
      city
      work
      education
      phone
      gender
      birthDate
      hometown
      languages
      expertise
      hobbies
      interests
      website
      socialLinks
      contactVisibility
      birthdayVisibility
    }
  }
`;

export const UPDATE_PREFERENCES_MUTATION = gql`
  mutation UpdatePreferences($input: UpdatePreferencesInput!) {
    updatePreferences(input: $input) {
      id
      theme
      locale
      timezone
      defaultPostAudience
      friendRequestPolicy
      messagePolicy
      highQualityUploads
      hdrVideo
      autoplay
      dataSaver
      stepGalleryFullscreen
      showNutritionOverlay
    }
  }
`;

