import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import {
  ApolloClient,
  gql,
  graphql,
  ApolloProvider,
  createNetworkInterface
} from 'react-apollo';

import { geolocated } from 'react-geolocated';

const client = new ApolloClient({
  networkInterface: createNetworkInterface(
    { uri: 'https://api.digitransit.fi/routing/v1/routers/finland/index/graphql' })
});

const ChannelsList = ({ data: { loading, error, nearest } }) => {
  if (loading) {
    return <p>Loading ...</p>;
  }
  if (error) {
    return <p>{error.message}</p>;
  }
  return <table>
    <thead><tr><th>Place</th><th>Distance</th><th>Bikes Available</th><th>Places empty</th></tr></thead>
    <tbody>
      {nearest.edges.map(ch => <tr key={ch.node.place.stationId}>
        <td>
          <a href={`https://maps.google.com?saddr=Current+Location&daddr=${ch.node.place.lat},${ch.node.place.lon}`}>{ch.node.place.name}</a>
        </td>
        <td>{ch.node.distance} m</td>
        <td>{ch.node.place.bikesAvailable}</td>
        <td>{ch.node.place.spacesAvailable}</td>
      </tr>)}
    </tbody>
  </table>;
};

const channelsListQuery = gql`query MyQuery { bikeRentalStations {
    stationId
    name
    lat
    lon
    bikesAvailable
    spacesAvailable
  }
}
 `;

const newQuery = gql`
 query foo($lat:Float, $lon:Float, $maxDistance:Int, $maxResults:Int) {nearest(lat:$lat, lon:$lon, maxDistance:$maxDistance, maxResults:$maxResults, filterByPlaceTypes:[BICYCLE_RENT])
  {edges
          {node
                {id
                  distance
        place {
          __typename
          ... on BikeRentalStation{id
          stationId
          name
          bikesAvailable
          spacesAvailable
          lon
          lat
          }
        }
      }
    }
  }
}
`;

const ChannelsListWithData = graphql(channelsListQuery)(ChannelsList);
const NewChannelsListWithData = graphql(newQuery, {
  options: (ownProps) => ({
    // pollInterval: 5000,
    variables: {
      lat: 60.1756332,
      lon: 24.9150216,
      maxDistance: 10000,
      maxResults: 500
    }
  })
})(ChannelsList);

class Geoloc extends React.Component {
  render() {
    return !this.props.isGeolocationAvailable
      ? <div>Your browser does not support Geolocation</div>
      : !this.props.isGeolocationEnabled
        ? <div>Geolocation is not enabled</div>
        : this.props.coords
          ? <table>
            <tbody>
              <tr><td>latitude</td><td>{this.props.coords.latitude}</td></tr>
              <tr><td>longitude</td><td>{this.props.coords.longitude}</td></tr>
              <tr><td>altitude</td><td>{this.props.coords.altitude}</td></tr>
              <tr><td>heading</td><td>{this.props.coords.heading}</td></tr>
              <tr><td>speed</td><td>{this.props.coords.speed}</td></tr>
            </tbody>
          </table>
          : <div>Getting the location data&hellip; </div>;
  }
}

const WrapGeolocated = geolocated({
  positionOptions: {
    enableHighAccuracy: false,
  },
  userDecisionTimeout: 5000
})(Geoloc);

class App extends Component {
  render() {
    return (
      <ApolloProvider client={client}>
        <div className="App">
          <div className="App-header">
            <h2>HSL Citybikes</h2>
          </div>
          <WrapGeolocated />
          <NewChannelsListWithData />
        </div>
      </ApolloProvider>
    );
  }
}
export default App;