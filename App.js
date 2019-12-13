import React from 'react';
import { StyleSheet, Text, View, FlatList, PanResponder, Animated } from 'react-native';
import ExampleComponent from './ExampleComponent';

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function immutableMove(arr, from, to) {
  return arr.reduce((prev, current, idx, self) => {
    if (from === to) {
      prev.push(current);
    }
    if (idx === from) {
      return prev;
    }
    if (from < to) {
      prev.push(current);
    }
    if (idx === to) {
      prev.push(self[from]);
    }
    if (from > to) {
      prev.push(current);
    }
    return prev;
  }, []);
}

const items = [
  {index: 0, vehicle: 'car', 'color': getRandomColor()},
  {index: 1, vehicle: 'truck', 'color': getRandomColor()},
  {index: 2, vehicle: 'bike', 'color': getRandomColor()},
  {index: 3, vehicle: 'horse', 'color': getRandomColor()}, 
  {index: 4, vehicle: 'tricycle', 'color': getRandomColor()},
  {index: 5, vehicle: 'unicycle', 'color': getRandomColor()}, 
  {index: 6, vehicle: 'motorcyle', 'color': getRandomColor()}, 
  {index: 7, vehicle: 'suv', 'color': getRandomColor()}, 
  {index: 8, vehicle: 'pickup truck', 'color': getRandomColor()},
  {index: 9, vehicle: 'sports car', 'color': getRandomColor()},
  {index: 10, vehicle: 'slingshot', 'color': getRandomColor()},
  {index: 11, vehicle: 'station wagon', 'color': getRandomColor()}
];

//li:nth-child(odd) { background: #eee; }
export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dragging: false,
      draggingIdx: -1,
      items
    };
    this.point = new Animated.ValueXY()
    this.scrollOffset = 0;
    this.flatlistTopOffset = 0;
    this.rowHeight = 0;
    this.currentIdx = -1;
    this.currentY = 0;
    this.active = false;
    this._panResponder = PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

      onPanResponderGrant: (evt, gestureState) => {
        // The gesture has started. Show visual feedback so the user knows
        // what is happening!
        // gestureState.d{x,y} will be set to zero now
        console.log(gestureState.y0);
        this.currentIdx = this.yToIndex(gestureState.y0); // Math.floor((this.scrollOffset + gestureState.y0 - this.flatlistTopOffset) / this.rowHeight);
        this.currentY = gestureState.y0;
        this.active = true;
        Animated.event([{y: this.point.y}])({y: gestureState.y0 - this.rowHeight / 2 });
        this.setState({ dragging: true, draggingIdx: this.currentIdx }, () => {
          this.animateList();
        });
      },
      onPanResponderMove: (evt, gestureState) => {
        // The most recent move distance is gestureState.move{X,Y}
        // The accumulated gesture distance since becoming responder is
        // gestureState.d{x,y}
        console.log(gestureState);
        this.currentY = gestureState.moveY;
        Animated.event([{y: this.point.y}])({y: gestureState.moveY});
      },
      onPanResponderTerminationRequest: (evt, gestureState) => false,
      onPanResponderRelease: (evt, gestureState) => {
        // The user has released all touches while this view is the
        // responder. This typically means a gesture has succeeded
        this.reset();
      },
      onPanResponderTerminate: (evt, gestureState) => {
        // Another component has become the responder, so this gesture
        // should be cancelled
        this.reset();
      },
      onShouldBlockNativeResponder: (evt, gestureState) => {
        // Returns whether this component should block native components from becoming the JS
        // responder. Returns true by default. Is currently only supported on android.
        return true;
      },
    });
  }

  animateList = () => {
    if (!this.active) {
      return;
    }

    requestAnimationFrame(() => {
      const newIdx = this.yToIndex(this.currentY);
      if (this.currentIdx !== newIdx) {
        this.setState({
          items: immutableMove(this.state.items, this.currentIdx, newIdx),
          draggingIdx: newIdx
        });
        this.currentIdx = newIdx;
      }
      this.animateList();
    });
  }

  yToIndex = (y) => {
    const value = Math.floor((this.scrollOffset + y - this.flatlistTopOffset) / this.rowHeight)
    if (value < 0) {
      return 0;
    }

    if (value > this.state.items.length - 1) {
      return this.state.items.length - 1;
    }

    console.log('value', value);
    return value;
  }

  reset = () => {
    this.active = false;
    this.setState({
      dragging: false,
      draggingIdx: -1
    });
  }

  renderItem = ({ item }, noPanResponder = false) => {
    const { draggingIdx } = this.state;
    const color = item.index%2 === 0 ? '#000' : '#eee';

    return(
      <View
        onLayout={e => {
          this.rowHeight = e.nativeEvent.layout.height;
        }}
        style={{
          padding: 16,
          backgroundColor: item.color,
          flexDirection: 'row',
          opacity: draggingIdx === item.index ? 0 : 1
        }}
      >
        <View {...(noPanResponder ? {} : this._panResponder.panHandlers)}>
          <Text style={{ fontSize: 28, color: color }}>@</Text>
        </View>
        <Text style={{ textAlign: 'center', flex: 1, fontSize: 22, color: color }}>{item.vehicle}</Text>
      </View>
    );
  }

  render () {
    const { dragging, draggingIdx } = this.state;
    return (
      <View style={styles.container}>
        { dragging && <Animated.View 
          style={{
            position: 'absolute',
            backgroundColor: this.state.items[draggingIdx].color,
            zIndex: 2,
            width: '100%',
            top: this.point.getLayout().top 
          }}>
          {this.renderItem({item: this.state.items[draggingIdx]}, true)}
        </Animated.View> }
        <FlatList
          scrollEnabled={!dragging}
          style={{width: '100%'}}
          data={this.state.items}
          renderItem={this.renderItem}
          keyExtractor={item => "" + item.index}
          onScroll={e => {
            this.scrollOffset = e.nativeEvent.contentOffset.y
          }}
          onLayout={e => {
            this.flatlistTopOffset = (e.nativeEvent && e.nativeEvent.contentOffset) ? e.nativeEvent.contentOffset.y : 0;
          }}
          scrollEventThrottle={16}
        />
      </View>

    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
