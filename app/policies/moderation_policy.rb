class ModerationPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      if user&.admin?
        scope.all
      else
        scope.none
      end
    end
  end

  def update?
    user&.active? && user.admin?
  end
end