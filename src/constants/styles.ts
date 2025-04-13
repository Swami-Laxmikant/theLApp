import {StyleSheet} from 'react-native';
import { fonts } from '../assets';

export const {flex1, wf, absFill, row, allCenter, atStart, spaceBetween, spaceAround} = StyleSheet.create({
  absFill: {
    position: 'absolute',
    inset: 0,
  },
  wf: {
    width: '100%',
  },
  flex1: {
    flex: 1,
  },
  allCenter: {
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  atStart: {
    alignSelf: 'flex-start',
  },
  row: {
    flexDirection: 'row',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  spaceAround: {
    justifyContent: 'space-around',
  },
});

const baseSize = 4;

export const {g10, g4, g6} = StyleSheet.create({
  g10: {
    gap: baseSize * 10,
  },
  g4: {
    gap: baseSize * 4,
  },
  g6: {
    gap: baseSize * 6,
  },
});

export const {p10, ph10, pv5, ph4, pv4, p4} = StyleSheet.create({
  p10: {
    padding: baseSize * 10,
  },
  ph10: {
    paddingHorizontal: baseSize * 10,
  },
  pv5: {
    paddingVertical: baseSize * 5,
  },
  ph4: {
    paddingHorizontal: baseSize * 4,
  },
  pv4: {
    paddingVertical: baseSize * 4,
  },
  p4: {
    padding: baseSize * 4,
  },
});

export const {textRegBerk, textRegAtk, textBoldAtk, textCenter} = StyleSheet.create({
  textRegBerk: {
    fontFamily: fonts.BerkshireSwashRegular.familyName,
  },
  textRegAtk: {
    fontFamily: fonts.AtkinsonHyperlegibleRegular.familyName,
  },
  textBoldAtk: {
    fontFamily: fonts.AtkinsonHyperlegibleBold.familyName,
  },
  textCenter: {
    textAlign: 'center',
  },
});
