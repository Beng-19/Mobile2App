import { getOrderItemImage } from '../src/components/orderItemImage';

describe('order item image resolution', () => {
  it('prefers the image path stored with the order item', () => {
    expect(getOrderItemImage('tui-xach.png', 'Áo sơ mi')).toEqual(
      require('../src/components/assets/images/tui-xach.png'),
    );
    expect(
      getOrderItemImage('content://media/item/1', 'Balo thời trang'),
    ).toEqual({ uri: 'content://media/item/1' });
  });

  it('uses the saved item name for a legacy or unavailable image path', () => {
    expect(getOrderItemImage('hinh1.jpg', 'Túi xách nữ')).toEqual(
      require('../src/components/assets/images/tui-xach.png'),
    );
    expect(getOrderItemImage('missing.jpg', 'Sản phẩm không rõ')).toBeUndefined();
  });
});
