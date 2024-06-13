# Data Plan

We plan to make use of 3 APIs for our web mapping.

## Songkick API

https://www.songkick.com/developer

The Songkick API allows us to search for past shows, concerts and events that an artist had participated in, including details such as performance venue, performance date and time, and show popularity. This API will be used as one of the main tools for acquiring data for use in our website, as the data is directly related to the topic of interest, and easily mappable.

Useful requests:

https://www.songkick.com/developer/past-events-for-artist

## Spotify Web API

https://developer.spotify.com/documentation/web-api/

The Spotify Web API can be used to obtain data regarding an artist's song releases and their popularity of songs, as well as images of the artist. This data can then be used together with the Twitter API to search for tweets related to the release close to the release date. We also plan to use the Spotify Web Playback SDK (https://developer.spotify.com/documentation/web-playback-sdk/) to add an in-website Spotify player. 

Useful requests:

https://developer.spotify.com/documentation/web-api/reference/#category-artists

https://developer.spotify.com/documentation/web-api/reference/#endpoint-get-an-artists-albums

## Twitter API

https://developer.twitter.com/en/docs/twitter-api

The Twitter API will be used to search for tweets related to an artist or a performance on specific dates and/or locations, such as the date of an album/song release, or near the vicinity of a performance venue. Related tweets with location data will be mapped and can be easily viewed. Specifically, we will use the Standard Search API to look for tweets related to an artist/performance, including geocode and until date as options.

Useful requests:

https://developer.twitter.com/en/docs/twitter-api/v1/tweets/search/api-reference/get-search-tweets
