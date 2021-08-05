import { convertDecimalToFixedFloat } from "./ConvertDecimalToFixedFloat";

export const getAmountByTypicalBalance = (typicalBalance, amount, column) =>
  typicalBalance === column ? convertDecimalToFixedFloat(amount.value) : 0;

export const getBalanceByTypicalBalance = (typicalBalance, amount, column) =>
  typicalBalance !== column ? convertDecimalToFixedFloat(amount.value) : 0;
