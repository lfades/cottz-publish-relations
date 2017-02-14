import { DDP } from 'meteor/ddp';

const data = {};

data.quotes = [
  {
    _id: '1',
    name: 'January',
    user: 'alex'
  },
  {
    _id: '2',
    name: 'february',
    user: 'max'
  },
  {
    _id: '3',
    name: 'march',
    user: 'julian'
  },
  {
    _id: '4',
    name: 'april',
    user: 'louis'
  },
  {
    _id: '5',
    name: 'may',
    user: 'darwin'
  },
  {
    _id: '6',
    name: 'june',
    user: 'morgan'
  },
  {
    _id: '7',
    name: 'july',
    user: 'steven'
  },
  {
    _id: '8',
    name: 'august',
    user: 'arunoda'
  },
  {
    _id: '9',
    name: 'september',
    user: 'sacha'
  },
  {
    _id: '10',
    name: 'october',
    user: 'chris'
  },
  {
    _id: '11',
    name: 'november',
    user: 'alan'
  },
  {
    _id: '12',
    name: 'december',
    user: 'nicol'
  }
];

data.names = ['sugar', 'flowers', 'many colors'];

const Client = () => {
  return DDP.connect(process.env.ROOT_URL);
}

export {data, Client};