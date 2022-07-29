const formatOrder = (order) => {
  let status = order.cancelled
    ? "cancelled"
    : order.finalized
    ? "finalized"
    : "active";

  return {
    createdDate: new Date(order.created_date),
    closingDate: new Date(order.closing_date),
    expirationTime: new Date(order.expiration_time),
    expirationDate: new Date(
      +new Date(order.created_date) + order.expiration_time
    ),
    orderData: order.protocol_data,
    orderHash: order.order_hash,
    maker: order.maker.address,
    contract: order.protocol_address,
    kind: "seaport",
    side: "bid",
    price: order.current_price,
    feeBreakdown: order.taker_fees.map((fee) => ({
      bsp: Number(fee.basis_points),
      address: fee.account.address,
    })),
    status,
    orderType: order.order_type,
    tokenId: order.taker_asset_bundle.assets[0].token_id,
    tokenContract: order.taker_asset_bundle.assets[0].asset_contract.address,
  };
};

module.exports = formatOrder;
