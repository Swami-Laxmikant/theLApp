import {DimensionValue, StyleSheet, View} from 'react-native';
import {flex1} from '../constants';

export const Spacer = () => <View style={flex1} />;

interface SpacerProps {
  size?: DimensionValue;
}

export const VSpacer = ({size}: SpacerProps) => (
  <View style={size === undefined ? vSpacer : {height: size}} />
);

export const HSpacer = ({size}: SpacerProps) => (
  <View style={size === undefined ? hSpacer : {width: size}} />
);

const {vSpacer, hSpacer} = StyleSheet.create({
  vSpacer: {
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  hSpacer: {
    marginLeft: 'auto',
    marginRight: 'auto',
  },
});
