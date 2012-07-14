require 'test_helper'

class OrdersControllerTest < ActionController::TestCase
  setup do
    @order = orders(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:orders)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create order" do
    assert_difference('Order.count') do
      post :create, order: { address: @order.address, address_line_two: @order.address_line_two, arm_circumference: @order.arm_circumference, arms: @order.arms, bust: @order.bust, chest: @order.chest, city: @order.city, first_name: @order.first_name, height: @order.height, hips: @order.hips, inseam: @order.inseam, last_name: @order.last_name, leg_circumference: @order.leg_circumference, outseam: @order.outseam, state: @order.state, waist: @order.waist, weight: @order.weight, zip: @order.zip }
    end

    assert_redirected_to order_path(assigns(:order))
  end

  test "should show order" do
    get :show, id: @order
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @order
    assert_response :success
  end

  test "should update order" do
    put :update, id: @order, order: { address: @order.address, address_line_two: @order.address_line_two, arm_circumference: @order.arm_circumference, arms: @order.arms, bust: @order.bust, chest: @order.chest, city: @order.city, first_name: @order.first_name, height: @order.height, hips: @order.hips, inseam: @order.inseam, last_name: @order.last_name, leg_circumference: @order.leg_circumference, outseam: @order.outseam, state: @order.state, waist: @order.waist, weight: @order.weight, zip: @order.zip }
    assert_redirected_to order_path(assigns(:order))
  end

  test "should destroy order" do
    assert_difference('Order.count', -1) do
      delete :destroy, id: @order
    end

    assert_redirected_to orders_path
  end
end
