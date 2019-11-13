Verification::Engine.routes.draw do
  namespace :web_api, :defaults => {:format => :json} do
    namespace :v1 do
      resources :verification_methods, only: [:index]
      Verification::VerificationService.new
        .all_methods
        .select{|vm| vm.veritication_method_type == :manual_sync}
        .each do |vm|
        post "verification_methods/#{vm.name}/verification" => "verifications#create", :defaults => { :method_name => vm.name }
      end
    end
  end
end