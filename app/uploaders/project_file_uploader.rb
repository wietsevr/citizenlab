class ProjectFileUploader < CarrierWave::Uploader::Base
  include BaseUploader

  # Include RMagick or MiniMagick support:
  # include CarrierWave::RMagick
  # include CarrierWave::MiniMagick

  # Choose what kind of storage to use for this uploader:
  # storage :file
  # storage :fog

  # Override the directory where uploaded files will be stored.
  # This is a sensible default for uploaders that are meant to be mounted:
  # def store_dir
  #   "uploads/#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}"
  # end

  # Provide a default URL as a default if there hasn't been a file uploaded:
  # def default_url
  #   # For Rails 3.1+ asset pipeline compatibility:
  #   # ActionController::Base.helpers.asset_path("fallback/" + [version_name, "default.png"].compact.join('_'))
  #
  #   "/images/fallback/" + [version_name, "default.png"].compact.join('_')
  # end

  # Process files as they are uploaded:
  # process scale: [200, 300]
  #
  # def scale(width, height)
  #   # do something
  # end

  # Create different versions of your uploaded files:
  # version :thumb do
  #   process resize_to_fit: [50, 50]
  # end



  # Add a white list of extensions which are allowed to be uploaded.
  # For images you might use something like this:
  def extension_whitelist
    %w(pdf doc docx xls xlsx ppt pptx txt sxw sxc sxi sdw sdc sdd csv mp3 mp4 mkv avi)
  end

  # def extension_blacklist
  #   %w(app asp bas bat bin cer chm cmd cnt com cpl crt csh der dmg exe fxp gadget hlp hpj hta inf ins isp its jar js jse ksh lnk mau msc msh msh1 msh2 mshxml msh1xml msh2xml msi msp mst osd pcd pif pl plg prf prg reg scf scr sct shb shs ps1 ps1xml ps2 ps2xml psc1 psc2 vb vbp vbs vsmacros vsw ws wsc wsf wsh xbap xnk)
  # end

  # Override the filename of the uploaded files:
  # Avoid using model.id or version_name here, see uploader/store.rb for details.
  # def filename
  #   model.name
  # end

  def fog_attributes
    # Deleting consecutive whitespaces in filename because of
    # https://github.com/fog/fog-aws/issues/160
    {"Content-Disposition" => "attachment; filename=\"#{model.name.strip.gsub(/\s+/, ' ')}\""}
  end

  def size_range
    1.byte..50.megabytes
  end

end