class Api::V1::MembershipsController < ApplicationController

  before_action :set_membership, only: [:show, :destroy]

  def index
    @memberships = policy_scope(Membership)
      .where(group_id: params[:group_id])
      .includes(:user)
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))
  	render json: @memberships
  end

  def show
    render json: @membership, include: ['user'], serializer: Api::V1::MembershipSerializer
  end

  # insert
  def create
    @membership = Membership.new(permitted_attributes(Membership))
    authorize @membership
    if @membership.save
      render json: @membership.reload, status: :created
    else
      render json: { errors: @membership.errors.details }, status: :unprocessable_entity
    end
  end

  # delete
  def destroy
    membership = @membership.destroy
    if membership.destroyed?
      head :ok
    else
      head 500
    end
  end

  def set_membership
    @membership = Membership.find params[:id]
    authorize @membership
  end

end
