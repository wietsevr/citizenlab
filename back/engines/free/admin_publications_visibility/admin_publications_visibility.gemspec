$:.push File.expand_path("lib", __dir__)

# Maintain your gem's version:
require "admin_publications_visibility/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |spec|
  s.name        = "admin_publications_visibility"
  s.version     = AdminPublicationsVisibility::VERSION
  s.authors     = ["CitizenLab"]
  s.licenses    = ['AGPLv3']
  s.description = 'Admin can make publications visible only to certain groups of users (e.g., admin only, smart groups).'

  spec.files = Dir["{app,config,db,lib}/**/*", "Rakefile", "README.md"]

  spec.add_dependency "rails", "~> 6.0.3", ">= 6.0.3.5"
end
