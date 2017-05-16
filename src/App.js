import React, { Component } from 'react';
import './App.css';

import {
  ApolloClient,
  gql,
  graphql,
  ApolloProvider,
  createNetworkInterface
} from 'react-apollo';

const client = new ApolloClient({
  networkInterface: createNetworkInterface(
  { uri: 'https://api.digitransit.fi/routing/v1/routers/finland/index/graphql' })
});

var options = {
  enableHighAccuracy: true, 
  maximumAge        : 30000, 
  timeout           : 1000
};


function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
};

class NotTheFinalList extends Component {

  constructor(props) {
    super(props);
    this.state = {};

    this.geoSuccess = this.geoSuccess.bind(this)
  }

  geoSuccess(pos) {
    var crd = pos.coords;
    
    // console.log('Your current position is:');
    // console.log(`Latitude : ${crd.latitude}`);
    // console.log(`Longitude: ${crd.longitude}`);
    // console.log(`More or less ${crd.accuracy} meters.`);
    this.setState({lat: crd.latitude,
      lon: crd.longitude})
    }

    componentDidMount() {
      navigator.geolocation.getCurrentPosition(this.geoSuccess, error, options);
    }

  render() {
        return (<NewChannelsListWithData lat={this.state.lat}
                                    lon={this.state.lon}/>)
    
  }
}

class StationList extends Component {

    render() {
      
      if (!this.props.data || this.props.data.loading) {
        return <p>Loading ...</p>;
      }
      if (this.props.data.error) {
        return <p>{this.props.data.error.message}</p>;
      }
      return <table>
      <thead><tr><th>Place</th><th>Distance</th><th>Bikes Available</th><th>Places empty</th></tr></thead>
      <tbody>
      {this.props.data.nearest.edges.map(ch => <tr key={ch.node.place.stationId}>
      <td>
      <a href={`https://maps.google.com?&dirflg=b&saddr=Current+Location&daddr=${ch.node.place.lat},${ch.node.place.lon}`}>{ch.node.place.name}</a>
      </td>
      <td>{ch.node.distance} m</td>
      <td className={ch.node.place.bikesAvailable < 5 ? 'low' : 'high'}>{ch.node.place.bikesAvailable}</td>
      <td className={ch.node.place.spacesAvailable < 5 ? 'low' : 'high'}>{ch.node.place.spacesAvailable}</td>
      </tr>)}
      </tbody>
      </table>;
    }
  }
  
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
  
  const NewChannelsListWithData = graphql(newQuery, {
    options: (ownProps) => ({
      // pollInterval: 5000,
      skip: ownProps.lat === 0 || !ownProps.lat,
     variables: {
        lat: ownProps.lat,
        lon: ownProps.lon,
        maxDistance: 10000,
        maxResults: 500
      }
    })
  })(StationList);

  class Footer extends Component {
    render() {
    return(<div className="App-Footer">
            (c) <a href="mailto:citybike@salegosse.net">Salegosse</a>
            </div>)
  }
  }
  
  class App extends Component {
    render() {
      return (
      <ApolloProvider client={client}>
      <div className="App">
        <div className="App-header">
          <h2>HSL Citybikes</h2>
        </div>
        <NotTheFinalList />
        
        <div><Footer /></div>
        </div>
        </ApolloProvider>
      );
    }
  }
  export default App;